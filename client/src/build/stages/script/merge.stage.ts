import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { BuildStage } from '../../builder';
import {
    ReadFileContents,
    WriteFileContents,
    FileExists,
} from "../../../utility";

const fsPromises = fs.promises;

export default class MergeStage extends BuildStage {
    static r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");

    constructor(task, pkg, ctx) {
        super("Merge", task, pkg, ctx);
    }

    /**
     * Collect Lua module names from require() forms used in DriverWorks drivers.
     * drivers-common-public often uses require ('a.b') with parentheses and/or a leading
     * assignment (e.g. Metrics = require ('...')); the line-anchored require "m" regex alone misses those.
     */
    static extractRequireModuleNames(fileDocument: string): string[] {
        const names: string[] = [];
        const seen = new Set<string>();
        const add = (name: string | undefined) => {
            const n = name?.trim();
            if (n && !seen.has(n)) {
                seen.add(n);
                names.push(n);
            }
        };
        for (const m of fileDocument.matchAll(/require\s*\(\s*(["'])([^"'\\]+)\1\s*\)/g)) {
            add(m[2]);
        }
        for (const m of fileDocument.matchAll(/require\s+(["'])([^"'\\]+)\1/g)) {
            add(m[2]);
        }
        return names;
    }

    regExpEscape(literal_string) {
        return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, "\\$&");
    }

    async FindModule(source: string, module: string) {
        try {
            let file = path.join(source, ...module.split(".")) + ".lua";
            let exists = await FileExists(file);

            if (!exists) {
                file = path.join(source, "../", ...module.split(".")) + ".lua";
                exists = await FileExists(file);
            }

            if (!exists) {
                console.log(`[MergeStage] Module file not found: ${module} at ${file}`);
                return null;
            }

            console.log(`[MergeStage] Found module file: ${module} at ${file}`);
            return file;
        } catch (error) {
            console.error(`[MergeStage] Error finding module ${module}:`, error);
            return null;
        }
    }

    async GetModules(source: string, module: string) {
        try {
            const filePath = await this.FindModule(source, module);
            if (!filePath) {
                const expected = path.join(source, ...module.split('.')) + '.lua';
                throw new Error(
                    `Failed to find required module "${module}". No file at "${expected}" (or parent-folder fallback). ` +
                    `Every require used while merge/squish is enabled must resolve to a .lua file under src.`
                );
            }

            let fileDocument = await ReadFileContents(filePath);
            let modules = [];

            if (!fileDocument) {
                console.log(`[MergeStage] No content found for module: ${module}`);
                return modules;
            }

            const nestedModuleNames = MergeStage.extractRequireModuleNames(fileDocument);

            // Recursively retrieve all nested modules
            for (const nestedModuleName of nestedModuleNames) {
                const nestedModulePath = await this.FindModule(source, nestedModuleName);
                if (!nestedModulePath) {
                    const expected = path.join(source, ...nestedModuleName.split('.')) + '.lua';
                    throw new Error(
                        `Failed to find required module "${nestedModuleName}" (imported from "${module}"). ` +
                        `No file at "${expected}". Runtime-only modules (e.g. http.request) cannot be merged—remove them or load them differently.`
                    );
                }

                let nested = await this.GetModules(source, nestedModuleName);

                if (nested && nested.length > 0) {
                    // Add nested modules to the flat array
                    modules.push(...nested);
                }

                modules.push(nestedModuleName);
            }

            if (modules.length > 0) {
                console.log(`[MergeStage] Found ${modules.length} nested modules in ${module}: ${modules.join(', ')}`);
            }

            return modules;
        } catch (error) {
            console.error(`[MergeStage] Error scanning module ${module}:`, error);
            throw error;
        }
    }

    /*
      async Execute(source: string, intermediate: string, _destination: string): Promise<any> {
          let srcFile = path.join(intermediate, "driver.lua")
          let srcDocument = await ReadFileContents(srcFile);
          let modules = "";
          let merged = [];
  
          let matches = srcDocument.matchAll(MergeStage.r);
  
          // Create module data for each require statement
          for (const match of matches) {
              let file = await this.FindModule(source, match[1])
              let fileDocument = await ReadFileContents(file);
  
              // This will automatically skip nested 'require' dependencies, libraries should be built with squish.
              if (!fileDocument){
                  continue;
              }
              
              let nestedPackages = await this.GetModules(source, match[1])
  
              merged.push(match[1])
              if (nestedPackages.length > 0) {
                  merged.push(nestedPackages)
              }
  
              for (const nested of nestedPackages) {
                  let doc = await ReadFileContents(path.join(source, ... nested.split('.')) + ".lua");
  
                  if (doc) {
                      modules = modules + `package.preload['${nested}'] = (function(...)\n ${doc}\n end)\n`
                  }
              }
  
              if (fileDocument) {
                  modules = modules + `package.preload['${match[1]}'] = (function(...)\n ${fileDocument}\n end)\n`
              }            
          }
  
          srcDocument = modules + srcDocument;
  
          await WriteFileContents(srcFile, srcDocument);
      }
      */

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua");
        
        try {
            let srcDocument = await ReadFileContents(srcFile);
            
            if (!srcDocument) {
                throw new Error(`Failed to read source file: ${srcFile}`);
            }
            
            console.log(`[MergeStage] Successfully read source file: ${srcFile}`);
            console.log(`[MergeStage] Source file size: ${srcDocument.length} characters`);
            
            if (
                //Find required modules and generate a squishy file for DriverPackager
                vscode.workspace.getConfiguration("control4").get<string>("buildMethod") == "DriverPackager") {
                const topLevelModules = MergeStage.extractRequireModuleNames(srcDocument);
                console.log(`[MergeStage] Found ${topLevelModules.length} top-level require module(s)`);
                
                let squishyFile = path.join(intermediate, "squishy");
                let squishes = ['Main "driver.lua"'];
                let allModules = new Set<string>(); // Use Set to avoid duplicates
                
                console.log(`[MergeStage] Processing squishy generation for DriverPackager`);
                console.log(`[MergeStage] Source directory: ${_source}`);
                console.log(`[MergeStage] Intermediate directory: ${intermediate}`);
                
                // Process top-level requires
                for (const moduleName of topLevelModules) {
                    console.log(`[MergeStage] Processing top-level module: ${moduleName}`);
                    allModules.add(moduleName);
                    
                    try {
                        // Recursively find all nested dependencies
                        const nestedModules = await this.GetModules(_source, moduleName);
                        if (nestedModules && nestedModules.length > 0) {
                            console.log(`[MergeStage] Found ${nestedModules.length} nested modules for ${moduleName}`);
                            nestedModules.forEach(module => allModules.add(module));
                        }
                    } catch (error) {
                        console.error(`[MergeStage] Error processing nested modules for ${moduleName}:`, error);
                        throw error;
                    }
                }
                
                console.log(`[MergeStage] Total unique modules found: ${allModules.size}`);
                
                if (allModules.size === 0) {
                    console.log(`[MergeStage] No modules found, generating basic squishy file`);
                }
                
                // Generate squishy entries for all modules
                for (const moduleName of allModules) {
                    const relativePath = moduleName.replace(/\./g, "/") + ".lua";
                    const squishyEntry = `Module "${moduleName}" "${relativePath}"`;
                    squishes.push(squishyEntry);
                    console.log(`[MergeStage] Adding squishy entry: ${squishyEntry}`);
                }
                
                squishes.push(`Output "driver.lua.squished"`);
                let squishyDocument = squishes.join("\r\n");
                
                // WriteFileContents swallows errors; a missing squishy surfaces only as a cryptic DriverPackager failure.
                await fsPromises.mkdir(path.dirname(squishyFile), { recursive: true });
                await fsPromises.writeFile(squishyFile, squishyDocument, 'utf8');
                console.log(`[MergeStage] Successfully wrote squishy file to: ${squishyFile}`);
                
                console.log(`[MergeStage] Generated squishy file content:`);
                console.log(squishyDocument);
                
                return `Generated squishy: ${squishyFile} with ${allModules.size} modules`;

            } else {
                // Match Lua require forms used in Control4 drivers (OpenSSL build path).
                // The old regex only matched require("m") with a closing ")" and missed require "m".
                const moduleNames: string[] = [];
                const seen = new Set<string>();
                const add = (name: string) => {
                    const n = name?.trim();
                    if (n && !seen.has(n)) {
                        seen.add(n);
                        moduleNames.push(n);
                    }
                };
                for (const m of srcDocument.matchAll(/^\s*?require\s+([('"])([^'")]+)\1/gm)) {
                    add(m[2]);
                }
                for (const m of srcDocument.matchAll(/require\s*\(\s*(["'])([^"'\\]+)\1\s*\)/gm)) {
                    add(m[2]);
                }

                let modules = "";
                let inlined = 0;
                for (const mod of moduleNames) {
                    let fileDocument = await ReadFileContents(
                        path.join(_source, ...mod.split(".")) + ".lua"
                    );

                    // Check to make sure the library exists, if not don't include it.
                    // This could be caused by a package using its own require statements in which case it should handle the package preload.
                    if (fileDocument) {
                        inlined++;
                        modules =
                            modules +
                            `package.preload['${mod}'] = (function(...)\n  local fn = load([[\n\n${fileDocument}\n\n]])\n\n  return fn()\nend)()\n`;
                    }
                }

                srcDocument = modules + srcDocument;
                await WriteFileContents(srcFile, srcDocument);
                return `Inlined ${inlined} module(s) into driver.lua (${moduleNames.length} require(s) seen)`;
            }
        } catch (error) {
            console.error(`[MergeStage] Merge Execute failed:`, error);
            // Do not wrap: preserves "Failed to find required module …" for notifications and logs.
            throw error instanceof Error ? error : new Error(String(error));
        }
    }

    OnSuccess(result: any): String {
        if (typeof result === "string") {
            return result;
        } else {
            return `${result}`;
        }
    }

    OnFailure(result: any): String {
        return "Failed to merge lua modules";
    }

    IsEnabled(): Boolean {
        return (this.task.merge || this.task.encryption);
    }
}
