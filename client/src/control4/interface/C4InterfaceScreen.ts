import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember, AnyT } from 'typedjson';
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
    iconProperty: string

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

    @jsonMember
    willTranslate: C4InterfaceTrait

    @jsonArrayMember(AnyT)
    items: any[];

    // DetailScreenType specific properties
    @jsonMember
    defaultActionProperty: string

    @jsonMember
    itemDefaultActionProperty: string

    @jsonMember
    itemActionIdsProperty: string

    @jsonMember
    attributionImage: string

    @jsonMember
    yearProperty: string

    @jsonMember
    ratingProperty: string

    @jsonMember
    paragraph: any

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

        // Add TitleProperty if present
        if (this.titleProperty) {
            node.ele("TitleProperty").txt(this.titleProperty);
        }

        // Add SubTitleProperty if present
        if (this.subtitleProperty) {
            node.ele("SubTitleProperty").txt(this.subtitleProperty);
        }

        // Add ImageProperty if present
        if (this.imageProperty) {
            node.ele("ImageProperty").txt(this.imageProperty);
        }

        // Add IconProperty if present
        if (this.iconProperty) {
            node.ele("IconProperty").txt(this.iconProperty);
        }

        // Add LengthProperty if present
        if (this.lengthProperty) {
            node.ele("LengthProperty").txt(this.lengthProperty);
        }

        // Add DefaultAction if present
        if (this.defaultAction) {
            node.ele("DefaultAction").txt(this.defaultAction);
        }

        // Add ActionIds if present
        if (this.actionIds && this.actionIds.length > 0) {
            node.ele("ActionIds").txt(this.actionIds.join(" "));
        }

        // Add WillTranslate if present
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

        // Add PaginationStyle if present
        if (this.paginationStyle) {
            node.ele("PaginationStyle").txt(this.paginationStyle);
        }

        // Add RequiresRefresh if present
        if (this.requiresRefresh) {
            node.ele("RequiresRefresh").txt(this.requiresRefresh.toString());
        }

        // Add DetailScreenType specific properties
        if (this.type === "DetailScreenType") {
            if (this.defaultActionProperty) {
                node.ele("DefaultActionProperty").txt(this.defaultActionProperty);
            }
            if (this.itemDefaultActionProperty) {
                node.ele("ItemDefaultActionProperty").txt(this.itemDefaultActionProperty);
            }
            if (this.itemActionIdsProperty) {
                node.ele("ItemActionIdsProperty").txt(this.itemActionIdsProperty);
            }
            if (this.attributionImage) {
                node.ele("AttributionImage").txt(this.attributionImage);
            }
            if (this.yearProperty) {
                node.ele("YearProperty").txt(this.yearProperty);
            }
            if (this.ratingProperty) {
                node.ele("RatingProperty").txt(this.ratingProperty);
            }
            if (this.paragraph) {
                let paragraph = node.ele("Paragraph");
                if (this.paragraph.headerTxt) {
                    paragraph.ele("HeaderTxt").txt(this.paragraph.headerTxt);
                }
                if (this.paragraph.contentProperty) {
                    paragraph.ele("ContentProperty").txt(this.paragraph.contentProperty);
                }
            }
        }

        // Add items for SettingsScreenType
        if (this.type === "SettingsScreenType" && this.items && this.items.length > 0) {
            this.items.forEach(item => {
                let itemNode = node.ele("Item");
                
                // Handle different item types
                if (item.type === "HeaderTxt") {
                    if (item.value) itemNode.ele("HeaderTxt").txt(item.value);
                } else if (item.type === "Text") {
                    if (item.label) itemNode.ele("Label").txt(item.label);
                    if (item.property) itemNode.ele("Text").att("propertyName", item.property);
                } else if (item.type === "TextField") {
                    if (item.label) itemNode.ele("Label").txt(item.label);
                    let textField = itemNode.ele("TextField");
                    if (item.property) textField.att("propertyName", item.property);
                    if (item.isPassword !== undefined) textField.att("isPassword", item.isPassword.toString());
                } else if (item.type === "Button") {
                    let button = itemNode.ele("Button");
                    if (item.name) button.ele("Name").txt(item.name);
                    if (item.command) {
                        let command = button.ele("Command");
                        command.ele("Name").txt(item.command.name);
                        command.ele("Type").txt(item.command.type);
                        if (item.command.params) {
                            let params = command.ele("Params");
                            item.command.params.forEach((param: any) => {
                                let paramNode = params.ele("Param");
                                paramNode.ele("Name").txt(param.name);
                                paramNode.ele("Type").txt(param.type);
                                if (param.value) {
                                    paramNode.ele("Value").txt(param.value);
                                }
                            });
                        }
                    }
                }
            });
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
        i.iconProperty = obj["IconProperty"];
        i.lengthProperty = obj["LengthProperty"];
        i.actionIdsProperty = obj["ActionIdsProperty"];
        i.list = C4InterfaceList.fromXml(obj.List);
        i.willTranslate = obj.WillTranslate ? C4InterfaceTrait.fromXml(obj.WillTranslate) : undefined;

        // Parse DetailScreenType specific properties
        i.defaultActionProperty = obj["DefaultActionProperty"];
        i.itemDefaultActionProperty = obj["ItemDefaultActionProperty"];
        i.itemActionIdsProperty = obj["ItemActionIdsProperty"];
        i.attributionImage = obj["AttributionImage"];
        i.yearProperty = obj["YearProperty"];
        i.ratingProperty = obj["RatingProperty"];
        
        if (obj["Paragraph"]) {
            i.paragraph = {
                headerTxt: obj["Paragraph"]["HeaderTxt"],
                contentProperty: obj["Paragraph"]["ContentProperty"]
            };
        }

        return i
    }
}