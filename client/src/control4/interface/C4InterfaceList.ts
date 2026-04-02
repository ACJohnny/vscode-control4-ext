import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceTrait from './C4InterfaceTrait';

@jsonObject
export default class C4InterfaceList {
    @jsonMember
    defaultAction: string

    @jsonMember
    defaultItemAction: string

    @jsonMember
    defaultActionProperty: string

    @jsonMember({ name: "ActionIdsProperty" })
    actionIdsProperty: string

    @jsonMember
    itemDefaultActionProperty: string

    @jsonArrayMember(String)
    actionIds: string[]

    @jsonMember
    itemActionIdsProperty: string

    @jsonMember
    titleProperty: string

    @jsonMember
    subtitleProperty: string

    @jsonMember
    imageProperty: string

    @jsonMember
    iconProperty: string

    @jsonMember
    lengthProperty: string

    @jsonMember
    isLink: C4InterfaceTrait

    @jsonMember
    isHeader: C4InterfaceTrait

    @jsonMember
    willTranslate: C4InterfaceTrait

    toXml() {
        let node = builder.create("List").root();

        if (this.defaultAction) {
            node.ele("DefaultAction").txt(this.defaultAction);
        }

        if (this.defaultItemAction) {
            node.ele("DefaultItemAction").txt(this.defaultItemAction);
        }

        if (this.defaultActionProperty) {
            node.ele("DefaultActionProperty").txt(this.defaultActionProperty);
        }

        if (this.actionIdsProperty) {
            node.ele("ActionIdsProperty").txt(this.actionIdsProperty);
        }

        if (this.itemDefaultActionProperty) {
            node.ele("ItemDefaultActionProperty").txt(this.itemDefaultActionProperty);
        }

        if (this.actionIds && this.actionIds.length > 0) {
            node.ele("ActionIds").txt(this.actionIds.join(" "));
        }

        if (this.itemActionIdsProperty) {
            node.ele("ItemActionIdsProperty").txt(this.itemActionIdsProperty);
        }

        if (this.titleProperty) {
            node.ele("TitleProperty").txt(this.titleProperty);
        }

        if (this.subtitleProperty) {
            node.ele("SubTitleProperty").txt(this.subtitleProperty);
        }

        if (this.imageProperty) {
            node.ele("ImageProperty").txt(this.imageProperty);
        }

        if (this.iconProperty) {
            node.ele("IconProperty").txt(this.iconProperty);
        }

        if (this.lengthProperty) {
            node.ele("LengthProperty").txt(this.lengthProperty);
        }

        if (this.isLink) {
            let isLink = node.ele("IsLink");
            isLink.ele("Property").txt(this.isLink.property);
            if (this.isLink.values) {
                let validValues = isLink.ele("ValidValues");
                this.isLink.values.forEach((value: string) => {
                    validValues.ele("Value").txt(value);
                });
            }
        }

        if (this.isHeader) {
            let isHeader = node.ele("IsHeader");
            isHeader.ele("Property").txt(this.isHeader.property);
            if (this.isHeader.values) {
                let validValues = isHeader.ele("ValidValues");
                this.isHeader.values.forEach((value: string) => {
                    validValues.ele("Value").txt(value);
                });
            }
        }

        if (this.willTranslate) {
            let willTranslate = node.ele("WillTranslate");
            willTranslate.ele("Property").txt(this.willTranslate.property);
            if (this.willTranslate.values) {
                let validValues = willTranslate.ele("ValidValues");
                this.willTranslate.values.forEach((value: string) => {
                    validValues.ele("Value").txt(value);
                });
            }
        }

        return node;
    }

    static fromXml(obj): C4InterfaceList {
        let i = new C4InterfaceList()

        i.defaultAction = obj["DefaultAction"]
        i.defaultItemAction = obj["DefaultItemAction"]
        i.itemDefaultActionProperty = obj["ItemDefaultActionProperty"]
        i.actionIds = obj["ActionIds"] ? obj["ActionIds"].split(" ") : [];
        i.itemActionIdsProperty = obj["ItemActionIdsProperty"];
        i.titleProperty = obj["TitleProperty"]
        i.subtitleProperty = obj["SubTitleProperty"];
        i.imageProperty = obj["ImageProperty"];
        i.iconProperty = obj["IconProperty"];
        i.lengthProperty = obj["LengthProperty"];

        i.isLink = obj.IsLink ? C4InterfaceTrait.fromXml(obj.IsLink) : undefined;
        i.isHeader = obj.IsHeader ? C4InterfaceTrait.fromXml(obj.IsHeader) : undefined;
        i.willTranslate = obj.WillTranslate ? C4InterfaceTrait.fromXml(obj.WillTranslate) : undefined;

        return i
    }
}