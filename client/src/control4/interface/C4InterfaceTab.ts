import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../utility';
import C4InterfaceCommand from './C4InterfaceCommand';

@jsonObject
export default class C4InterfaceTab {
    @jsonMember
    iconId: string

    @jsonMember
    name: string

    @jsonMember
    screenId: string

    @jsonMember
    screenCommand: C4InterfaceCommand

    toXml() {
        let node = builder.create("Tab").root();

        node.ele("Name").txt(this.name);
        node.ele("ScreenId").txt(this.screenId);
        node.ele("IconId").txt(this.iconId);

        // Add ScreenCommand if present
        if (this.screenCommand) {
            let screenCommand = node.ele("ScreenCommand");
            screenCommand.ele("Name").txt(this.screenCommand.name);
            screenCommand.ele("Type").txt(this.screenCommand.type);
            
            // Add params if present
            if (this.screenCommand.params && this.screenCommand.params.length > 0) {
                let params = screenCommand.ele("Params");
                this.screenCommand.params.forEach(p => {
                    params.import(p.toXml());
                });
            }
        }

        return node;
    }

    static fromXml(obj): C4InterfaceTab {
        let i = new C4InterfaceTab()

        i.name = obj["Name"]
        i.screenId = obj["ScreenId"];
        i.iconId = obj["IconId"];
        
        if (obj["ScreenCommand"]) {
            i.screenCommand = C4InterfaceCommand.fromXml(obj["ScreenCommand"]);
        }

        return i
    }
}