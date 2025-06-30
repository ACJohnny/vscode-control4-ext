import * as path from 'path';

import { BuildStage } from '../../builder';
import { Driver } from '../../../control4/driver';
import { WriteFileContents } from '../../../utility';

export default class DriverXmlBuildStage extends BuildStage {
    constructor(task, pkg, ctx) { super("XML", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        console.log(`[XML_STAGE] Starting XML build stage`);
        let driver = await Driver.From(this.pkg);
        console.log(`[XML_STAGE] Driver created from package`);
        driver.encrypted = this.task.encryption;
        
        console.log(`[XML_STAGE] About to call driver.build()`);
        let content = driver.build();     
        console.log(`[XML_STAGE] Driver.build() completed, content length: ${content.length}`);

        return await WriteFileContents(path.join(intermediate, "driver.xml"), content);
    }

    OnSuccess(result: any): String {
        return `Built driver.xml`;
    }

    OnFailure(result: any): String {
        return `Failed to build driver.xml: ${result}`;
    }

    IsEnabled(): Boolean {
        return true;
    }
}



