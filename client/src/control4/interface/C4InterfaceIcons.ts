import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceIcon from "./C4InterfaceIcon"

@jsonObject
export default class C4InterfaceIcons {
    @jsonMember
    id: string

    @jsonArrayMember(Number)
    sizes: number[]

    @jsonMember
    template: string

    @jsonArrayMember(C4InterfaceIcon)
    icons?: C4InterfaceIcon[]

    toXml() {
        let node = builder.create("IconGroup").root();

        // Add id attribute
        if (this.id) {
            node.att("id", this.id);
        }

        // Add icons if present
        if (this.icons && this.icons.length > 0) {
            this.icons.forEach(icon => {
                node.import(icon.toXml());
            });
        }

        return node;
    }

    static fromXml(obj): C4InterfaceIcons {
        let icons = new C4InterfaceIcons();

        icons.id = obj["@id"]
        icons.icons = obj.Icon.map(function (i) {
            return C4InterfaceIcon.fromXml(i);
        })

        return icons;
    }
}