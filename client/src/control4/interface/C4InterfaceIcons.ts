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

        // If we have sizes and template, generate icons for each size
        if (this.sizes && this.sizes.length > 0 && this.template) {
            this.sizes.forEach(size => {
                let iconPath = this.template.replace(/%size%/gi, size.toString());
                let iconNode = node.ele("Icon");
                iconNode.att("height", size.toString());
                iconNode.att("width", size.toString());
                iconNode.txt(iconPath);
            });
        }
        // Add icons if present (for backward compatibility)
        else if (this.icons && this.icons.length > 0) {
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