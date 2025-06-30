import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

@jsonObject
export default class C4InterfaceParameter {
    @jsonMember
    name: string

    @jsonMember
    type: string

    @jsonMember
    value: string

    toXml() {
        let node = builder.create("Param").root();

        node.ele("Name").txt(this.name);
        node.ele("Type").txt(this.type);
        if (this.value) {
            node.ele("Value").txt(this.value);
        }

        return node;
    }

    static fromXml(obj): C4InterfaceParameter {
        let i = new C4InterfaceParameter()

        i.name = obj["Name"]
        i.type = obj["Type"]
        i.value = obj["Value"];

        return i
    }
}