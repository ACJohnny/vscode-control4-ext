import * as path from 'path';
import { BuildStage } from '../../builder';
import { ReadFileContents, WriteFileContents } from '../../../utility';

export default class InjectionStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Inject", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        let injections = ["\r\n\r\n----Injected by build task:----"]
        
        if(this.task.development){
            injections.push("C4:AllowExecute(true)")
        }
        if(this.task.injections && this.task.injections.length > 0){
            for (let i = 0; i < this.task.injections.length; i++) {
                injections.push(this.task.injections[i])
            }
        }

        injections.push("----End injected code----\r\n\r\n")
        if(injections.length >2){
            
        let src = injections.concat() + srcDocument;
        
        await WriteFileContents(srcFile, src);
        return injections.length-2;
        } else {
            return;
        }
    }

    OnSuccess(result: any): String {
        if (result > 0 ) {
            return `Injected ${result} item(s) in to driver.lua`;
        } else {
            return `Nothing to inject`;
        }
    }

    OnFailure(result: any): String {
        return "Code injection failed";
    }

    IsEnabled(): Boolean {     
        return this.task.development || (this.task.injections && this.task.injections.length > 0);
    }
}



