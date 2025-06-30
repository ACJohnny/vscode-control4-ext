import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../utility';

@jsonObject
export default class C4InterfaceTab {
    @jsonMember
    iconId: string

    @jsonMember
    name: string

    @jsonMember
    screenId: string

    toXml() {
        let node = builder.create("Tab").root();

        node.ele("Id").txt(this.screenId);
        node.ele("Name").txt(this.name);
        node.ele("IconId").txt(this.iconId);
        node.ele("ScreenId").txt(this.screenId);

        return node;
    }

    static fromXml(obj): C4InterfaceTab {
        let i = new C4InterfaceTab()

        i.name = obj["Name"]
        i.screenId = obj["ScreenId"];
        i.iconId = obj["IconId"];

        return i
    }
}