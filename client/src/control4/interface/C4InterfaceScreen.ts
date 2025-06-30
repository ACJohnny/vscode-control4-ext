import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceDataCommand from './C4InterfaceDataCommand';
import C4InterfaceList from './C4InterfaceList';

import { asBoolean } from "../utility";
import C4InterfaceTrait from './C4InterfaceTrait';

@jsonObject
export default class C4InterfaceScreen {
    @jsonMember
    id: string

    @jsonMember
    name: string

    @jsonMember
    type: string

    @jsonMember
    dataCommand: C4InterfaceDataCommand

    @jsonMember
    paginationStyle: string

    @jsonMember
    requiresRefresh: boolean

    @jsonMember
    titleProperty: string

    @jsonMember
    subtitleProperty: string

    @jsonMember
    imageProperty: string

    @jsonMember
    lengthProperty: string

    @jsonMember
    actionIdsProperty: string

    @jsonMember
    list: C4InterfaceList

    @jsonMember
    defaultAction: string

    @jsonArrayMember(String)
    actionIds: string[]

    @jsonMember
    defaultView: string

    @jsonMember
    gridDisplayHint: string

    @jsonMember
    grid: any

    toXml() {
        let node = builder.create("Screen").root();

        // Add type attribute
        if (this.type) {
            node.att("xsi:type", this.type);
        }

        // Add Id element
        if (this.id) {
            node.ele("Id").txt(this.id);
        }

        // Add DataCommand if present
        if (this.dataCommand) {
            node.import(this.dataCommand.toXml());
        }

        // Add PaginationStyle if present
        if (this.paginationStyle) {
            node.ele("PaginationStyle").txt(this.paginationStyle);
        }

        // Add RequiresRefresh if present
        if (this.requiresRefresh) {
            node.ele("RequiresRefresh").txt(this.requiresRefresh.toString());
        }

        // Add DefaultAction if present
        if (this.defaultAction) {
            node.ele("DefaultAction").txt(this.defaultAction);
        }

        // Add ActionIds if present
        if (this.actionIds && this.actionIds.length > 0) {
            node.ele("ActionIds").txt(this.actionIds.join(" "));
        }

        // Add DefaultView if present
        if (this.defaultView) {
            node.ele("DefaultView").txt(this.defaultView);
        }

        // Add GridDisplayHint if present
        if (this.gridDisplayHint) {
            node.ele("GridDisplayHint").txt(this.gridDisplayHint);
        }

        // Add List if present
        if (this.list) {
            node.import(this.list.toXml());
        }

        // Add Grid if present
        if (this.grid) {
            let grid = node.ele("Grid");
            
            if (this.grid.defaultAction) {
                grid.ele("DefaultAction").txt(this.grid.defaultAction);
            }
            
            if (this.grid.titleProperty) {
                grid.ele("TitleProperty").txt(this.grid.titleProperty);
            }
            
            if (this.grid.subtitleProperty) {
                grid.ele("SubTitleProperty").txt(this.grid.subtitleProperty);
            }
            
            if (this.grid.missingArtIconProperty) {
                grid.ele("MissingArtIconProperty").txt(this.grid.missingArtIconProperty);
            }
            
            if (this.grid.imageProperty) {
                let imageProperty = grid.ele("ImageProperty");
                if (this.grid.imageProperty.targetWidth && this.grid.imageProperty.targetHeight) {
                    imageProperty.att("targetWidth", this.grid.imageProperty.targetWidth.toString());
                    imageProperty.att("targetHeight", this.grid.imageProperty.targetHeight.toString());
                }
                imageProperty.txt(this.grid.imageProperty.path || this.grid.imageProperty);
            }
            
            if (this.grid.isLink) {
                let isLink = grid.ele("IsLink");
                isLink.ele("Property").txt(this.grid.isLink.property);
                if (this.grid.isLink.validValues) {
                    let validValues = isLink.ele("ValidValues");
                    this.grid.isLink.validValues.forEach((value: string) => {
                        validValues.ele("Value").txt(value);
                    });
                }
            }
        }

        return node;
    }

    static fromXml(obj): C4InterfaceScreen {
        let i = new C4InterfaceScreen()

        i.type = obj["@type"] || obj["@xsi:type"];
        i.id = obj["Id"];
        i.dataCommand = C4InterfaceDataCommand.fromXml(obj.DataCommand);
        i.paginationStyle = obj["PaginationStyle"];
        i.requiresRefresh = asBoolean(obj["RequiresRefresh"]);
        i.titleProperty = obj["TitleProperty"];
        i.subtitleProperty = obj["SubtitleProperty"];
        i.imageProperty = obj["ImageProperty"];
        i.lengthProperty = obj["LengthProperty"];
        i.actionIdsProperty = obj["ActionIdsProperty"];
        i.list = C4InterfaceList.fromXml(obj.List);

        return i
    }
}