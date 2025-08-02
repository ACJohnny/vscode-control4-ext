import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './C4InterfaceCommand';

@jsonObject
export default class C4InterfaceAction {
    @jsonMember
    id: string

    @jsonMember
    name: string

    @jsonMember
    icon_id: string

    @jsonMember
    edit_property: string

    @jsonMember
    command: C4InterfaceCommand

    @jsonArrayMember(Object)
    filters: any[]

    constructor(options?: any) {
        if (options) {
            this.id = options.id;
            this.name = options.name;
            this.icon_id = options.icon_id;
            this.edit_property = options.edit_property;
            this.command = options.command;
            this.filters = options.filters;
        }
    }

    toXml() {
        let node = builder.create("Action").root();
        
        node.ele("Id").txt(this.id);
        node.ele("Name").txt(this.name);
        
        if (this.icon_id) {
            node.ele("IconId").txt(this.icon_id);
        }

        if (this.edit_property) {
            node.ele("EditProperty").txt(this.edit_property);
        }

        if (this.command) {
            let command = node.ele("Command");
            command.ele("Name").txt(this.command.name);
            command.ele("Type").txt(this.command.type);
            
            if (this.command.params) {
                let params = command.ele("Params");
                this.command.params.forEach((param: any) => {
                    let paramNode = params.ele("Param");
                    paramNode.ele("Name").txt(param.name);
                    paramNode.ele("Type").txt(param.type);
                    if (param.value) {
                        paramNode.ele("Value").txt(param.value);
                    }
                });
            }
        }

        if (this.filters) {
            let filters = node.ele("Filters");
            this.filters.forEach((filter: any) => {
                let filterNode = filters.ele("Filter");
                filterNode.ele("Type").txt(filter.type);
                filterNode.ele("Property").txt(filter.property);
                
                if (filter.name) {
                    filterNode.ele("Name").txt(filter.name);
                }
                
                if (filter.icon_id) {
                    filterNode.ele("IconId").txt(filter.icon_id);
                }
                
                if (filter.valid_values) {
                    let validValues = filterNode.ele("ValidValues");
                    filter.valid_values.forEach((value: string) => {
                        validValues.ele("Value").txt(value);
                    });
                }
            });
        }

        return node;
    }

    static fromXml(obj: any): C4InterfaceAction {
        const action = new C4InterfaceAction();
        
        action.id = obj.Id;
        action.name = obj.Name;
        action.icon_id = obj.IconId;
        action.edit_property = obj.EditProperty;
        
        if (obj.Command) {
            action.command = C4InterfaceCommand.fromXml(obj.Command);
        }

        if (obj.Filters && obj.Filters.Filter) {
            action.filters = Array.isArray(obj.Filters.Filter)
                ? obj.Filters.Filter.map((f: any) => ({
                    type: f.Type,
                    property: f.Property,
                    name: f.Name,
                    icon_id: f.IconId,
                    valid_values: f.ValidValues ? f.ValidValues.Value : []
                }))
                : [{
                    type: obj.Filters.Filter.Type,
                    property: obj.Filters.Filter.Property,
                    name: obj.Filters.Filter.Name,
                    icon_id: obj.Filters.Filter.IconId,
                    valid_values: obj.Filters.Filter.ValidValues ? obj.Filters.Filter.ValidValues.Value : []
                }];
        }

        return action;
    }
} 