import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

import { BuildStage } from '../../builder';

export default class CopyToOutputStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Output", task, pkg, ctx) }

    async Execute(_source: string, _intermediate: string, destination: string): Promise<any> {
        console.log('[OUTPUT_STAGE] Starting Output stage');
        return new Promise(async (resolve, reject) => {
            try {
                if (vscode.workspace.getConfiguration('control4.build').get<boolean>('exportToDriverLocation')) {
                    let root = vscode.workspace.getConfiguration('control4.build').get<string>('directory')
            
                    let dst_file = path.join(root, this.pkg.name + ".c4z")
                    let src_file = path.join(destination, this.pkg.name + ".c4z")
                    console.log(`[OUTPUT_STAGE] Copying from ${src_file} to ${dst_file}`);
    
                    await fs.promises.copyFile(src_file, dst_file);
                    console.log('[OUTPUT_STAGE] Copy completed successfully');

                    return resolve(dst_file);
                }
                console.log('[OUTPUT_STAGE] exportToDriverLocation is disabled, skipping copy');
                return resolve(false);
            } catch (err) {
                console.error('[OUTPUT_STAGE] Error during output copy:', err);
                reject(err);
            }
        })
    }

    OnSuccess(result: any): String {
        if (result) {
            vscode.window.showInformationMessage(`"${this.pkg.name}.c4z" built at ${new Date().toLocaleTimeString()}`, { modal: false }, "Open .c4z", "Open driver.xml", "Ok").then(selection => {
                if (selection === "Open .c4z") {
                  vscode.env.openExternal(vscode.Uri.file(result));
                } else if (selection === "Open driver.xml") {
                    // Open the driver.xml file from the intermediate directory
                    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                    if (workspaceRoot) {
                        const intermediatePath = path.join(workspaceRoot, 'intermediate', this.task.version, 'driver.xml');
                        vscode.workspace.openTextDocument(intermediatePath).then(doc => {
                            vscode.window.showTextDocument(doc);
                        });
                    }
                }
            });

            return `Copied to ${result}`;
        }

        return "Skipped";
    }

    OnFailure(result: any): String {
        vscode.window.showErrorMessage(result.message);

        return `${result.message}`;
    }

    IsEnabled(): Boolean {
        return true
    }
}






