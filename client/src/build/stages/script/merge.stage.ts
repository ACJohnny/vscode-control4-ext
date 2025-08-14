import * as path from 'path';
import * as vscode from 'vscode';
import { BuildStage } from '../../builder';
import {
    ReadFileContents,
    WriteFileContents,
    FileExists,
} from "../../../utility";

export default class MergeStage extends BuildStage {
    static r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");

    constructor(task, pkg, ctx) {
        super("Merge", task, pkg, ctx);
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
                console.log(`[MergeStage] Skipping module ${module} - file not found`);
                return [];
            }

            let fileDocument = await ReadFileContents(filePath);
            let modules = [];

            if (!fileDocument) {
                console.log(`[MergeStage] No content found for module: ${module}`);
                return modules;
            }

            // Use the same regex pattern as the squishy generation for consistency
            // This pattern matches require statements in these formats:
            // require('module') - with parentheses and quotes
            // require 'module'  - without parentheses, with quotes
            // require("module") - with parentheses and double quotes
            // require "module"  - without parentheses, with double quotes
            let r = new RegExp(/^\s*?require\s+([('"])([^'")]+)\1$/, "gm");
            let moduleMatches = fileDocument.matchAll(r);

            // Recursively retrieve all nested modules
            for (const match of moduleMatches) {
                const nestedModuleName = match[2];
                
                if (!nestedModuleName || nestedModuleName.trim() === '') {
                    console.warn(`[MergeStage] Skipping invalid nested module name: ${nestedModuleName}`);
                    continue;
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
            return [];
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
                // Regex pattern to match require statements in these formats:
                // require('module') - with parentheses and quotes
                // require 'module'  - without parentheses, with quotes
                // require("module") - with parentheses and double quotes
                // require "module"  - without parentheses, with double quotes
                let r = new RegExp(/^\s*?require\s+([('"])([^'")]+)\1$/, "gm");
                let matches = srcDocument.matchAll(r);
                
                // Convert matches to array for easier processing
                let matchesArray = Array.from(matches);
                console.log(`[MergeStage] Found ${matchesArray.length} top-level require statements`);
                
                let squishyFile = path.join(intermediate, "squishy");
                let squishes = ['Main "driver.lua"'];
                let allModules = new Set<string>(); // Use Set to avoid duplicates
                
                console.log(`[MergeStage] Processing squishy generation for DriverPackager`);
                console.log(`[MergeStage] Source directory: ${_source}`);
                console.log(`[MergeStage] Intermediate directory: ${intermediate}`);
                
                // Process top-level requires
                for (const match of matchesArray) {
                    const moduleName = match[2];
                    
                    if (!moduleName || moduleName.trim() === '') {
                        console.warn(`[MergeStage] Skipping invalid module name: ${moduleName}`);
                        continue;
                    }
                    
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
                        // Continue processing other modules even if one fails
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
                
                try {
                    await WriteFileContents(squishyFile, squishyDocument);
                    console.log(`[MergeStage] Successfully wrote squishy file to: ${squishyFile}`);
                } catch (error) {
                    console.error(`[MergeStage] Failed to write squishy file:`, error);
                    throw new Error(`Failed to generate squishy file: ${error.message}`);
                }
                
                console.log(`[MergeStage] Generated squishy file content:`);
                console.log(squishyDocument);
                
                return `Generated squishy: ${squishyFile} with ${allModules.size} modules`;

            } else {
                let r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");

                let matches = srcDocument.matchAll(r);
                let modules = "";
                // Create module data for each require statement
                for (const match of matches) {
                    let fileDocument = await ReadFileContents(
                        path.join(_source, ...match[1].split(".")) + ".lua"
                    );

                    // Check to make sure the library exists, if not don't include it.
                    // This could be caused by a package using its own require statements in which case it should handle the package preload.
                    if (fileDocument) {
                        modules =
                            modules +
                            `package.preload['${match[1]}'] = (function(...)\n  local fn = load([[\n\n${fileDocument}\n\n]])\n\n  return fn()\nend)()\n`;
                    }
                }

                srcDocument = modules + srcDocument;
                await WriteFileContents(srcFile, srcDocument);
            }
        } catch (error) {
            console.error(`[MergeStage] Error reading source file:`, error);
            throw new Error(`Failed to read source file ${srcFile}: ${error.message}`);
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
