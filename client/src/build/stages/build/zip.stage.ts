import * as vscode from 'vscode';
import * as path from 'path';

import { BuildStage } from '../../builder';
import { ForceWrite } from '../../../utility';
import AdmZip from 'adm-zip'

export default class ZipStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Zip", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, destination: string): Promise<any> {
        console.log('[ZIP_STAGE] Starting Zip build stage');
        return new Promise(async (resolve, reject) => {
            var zip = new AdmZip();
            console.log(`[ZIP_STAGE] Adding local folder to zip: ${intermediate}`);
            zip.addLocalFolder(intermediate);

            try {
                let zipPath = path.resolve(destination, `${this.pkg.name}.c4z`);
                console.log(`[ZIP_STAGE] Writing zip to: ${zipPath}`);
                await ForceWrite(zipPath, zip.toBuffer());
                console.log('[ZIP_STAGE] Zip file written successfully');
                resolve(zipPath)
            } catch (err) {
                console.error('[ZIP_STAGE] Error during zip creation:', err);
                reject(err);
            }
        })
    }

    OnSuccess(result: any): String {
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

        return `Created ${result}`;
    }

    OnFailure(result: any): String {
        return `${result.message}`;
    }

    IsEnabled(): Boolean {
        return vscode.workspace.getConfiguration('control4').get<string>('buildMethod') == "OpenSSL"
    }
}



