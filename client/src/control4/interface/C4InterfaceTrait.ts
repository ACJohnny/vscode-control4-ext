import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

@jsonObject
export default class C4InterfaceTrait {
    name: string

    @jsonMember
    property: string

    @jsonArrayMember(String)
    values: string[]

    constructor() {
        this.values = [];
    }

    toXml() {
        let node = builder.create(this.name || "Trait").root();

        if (this.property) {
            node.ele("Property").txt(this.property);
        }

        if (this.values && this.values.length > 0) {
            let validValues = node.ele("ValidValues");
            this.values.forEach(value => {
                validValues.ele("Value").txt(value);
            });
        }

        return node;
    }

    static fromXml(obj): C4InterfaceTrait {
        let i = new C4InterfaceTrait();

        i.property = obj["Property"];
        i.values = obj["ValidValues"] ? obj["ValidValues"] : [];

        return i
    }
}