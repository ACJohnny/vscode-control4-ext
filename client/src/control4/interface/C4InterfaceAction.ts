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
} 