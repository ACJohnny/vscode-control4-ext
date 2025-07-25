import * as vscode from 'vscode';

import { BuildStage } from '../../builder';
import Manifest from '../../../control4/manifest';

export default class ManifestStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Manifest", task, pkg, ctx) }

    async Execute(source: string, intermediate: string, destination: string): Promise<any> {
        console.log('[MANIFEST_STAGE] Starting Manifest build stage');
        let manifest = new Manifest(this.pkg.name);
        console.log(`[MANIFEST_STAGE] Manifest instance created for package: ${this.pkg.name}`);

        manifest.encrypted = this.task.encryption;
        manifest.merge = this.task.merge;
        console.log(`[MANIFEST_STAGE] Set manifest.encrypted=${manifest.encrypted}, manifest.merge=${manifest.merge}`);

        try {
            const result = await manifest.build(source, intermediate, destination, true);
            console.log('[MANIFEST_STAGE] Manifest build completed successfully');
            return result;
        } catch (err) {
            console.error('[MANIFEST_STAGE] Error during manifest build:', err);
            throw err;
        }
    }

    OnSuccess(result: any): String {
        return `Built ${this.pkg.name}.c4z`;
    }

    OnFailure(result: any): String {
        return `Failed to build ${this.pkg.name}.c4z`;
    }

    IsEnabled(): Boolean {
        return vscode.workspace.getConfiguration('control4').get<string>('buildMethod') == "DriverPackager"
    }
}



