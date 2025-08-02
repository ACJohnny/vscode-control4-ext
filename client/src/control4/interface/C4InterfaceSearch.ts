import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './C4InterfaceCommand';

@jsonObject
export class C4InterfaceFilter {
    @jsonMember
    id: string;

    @jsonMember
    name: string;

    @jsonMember
    screenId: string;
}

@jsonObject
export class C4InterfaceHistoryEntry {
    @jsonMember
    dataCommand: C4InterfaceCommand;

    @jsonMember
    deleteCommand: C4InterfaceCommand;

    @jsonMember
    textProperty: string;
}

@jsonObject
export default class C4InterfaceSearch {
    @jsonArrayMember(C4InterfaceFilter)
    filters: C4InterfaceFilter[];

    @jsonArrayMember(C4InterfaceHistoryEntry)
    history: C4InterfaceHistoryEntry[];

    constructor(options?: any) {
        if (options) {
            this.filters = options.filters || [];
            this.history = options.history || [];
        }
    }

    toXml() {
        let node = builder.create("Search").root();
        
        if (this.filters && this.filters.length > 0) {
            let filters = node.ele("Filters");
            this.filters.forEach((filter) => {
                let filterNode = filters.ele("SearchFilter");
                filterNode.ele("Id").txt(filter.id);
                filterNode.ele("Name").txt(filter.name);
                filterNode.ele("ScreenId").txt(filter.screenId);
            });
        }

        if (this.history && this.history.length > 0) {
            let history = node.ele("History");
            // Take the first history entry for the DataCommand and TextProperty
            const entry = this.history[0];
            if (entry.dataCommand) {
                let dataCommand = history.ele("DataCommand");
                dataCommand.ele("Name").txt(entry.dataCommand.name);
                dataCommand.ele("Type").txt(entry.dataCommand.type);
                if (entry.dataCommand.params) {
                    let params = dataCommand.ele("Params");
                    entry.dataCommand.params.forEach((param: any) => {
                        let paramNode = params.ele("Param");
                        paramNode.ele("Name").txt(param.name);
                        paramNode.ele("Type").txt(param.type);
                        if (param.value) {
                            paramNode.ele("Value").txt(param.value);
                        }
                    });
                }
            }
            
            if (entry.textProperty) {
                history.ele("TextProperty").txt(entry.textProperty);
            }
        }

        return node;
    }

    static fromXml(obj: any): C4InterfaceSearch {
        const search = new C4InterfaceSearch();
        
        // Handle filters - support both XML and JSON structures
        if (obj.Filters) {
            if (obj.Filters.SearchFilter) {
                // XML structure
                search.filters = Array.isArray(obj.Filters.SearchFilter) 
                    ? obj.Filters.SearchFilter.map((f: any) => ({
                        id: f.Id,
                        name: f.Name,
                        screenId: f.ScreenId
                    }))
                    : [{
                        id: obj.Filters.SearchFilter.Id,
                        name: obj.Filters.SearchFilter.Name,
                        screenId: obj.Filters.SearchFilter.ScreenId
                    }];
            } else if (Array.isArray(obj.Filters)) {
                // JSON structure from UI config
                search.filters = obj.Filters.map((f: any) => ({
                    id: f.id,
                    name: f.name,
                    screenId: f.screenId
                }));
            }
        }

        // Handle history - support both XML and JSON structures
        if (obj.History) {
            if (obj.History.HistoryEntry) {
                // XML structure
                search.history = Array.isArray(obj.History.HistoryEntry)
                    ? obj.History.HistoryEntry.map((h: any) => ({
                        dataCommand: h.DataCommand ? C4InterfaceCommand.fromXml(h.DataCommand) : null,
                        deleteCommand: h.DeleteCommand ? C4InterfaceCommand.fromXml(h.DeleteCommand) : null,
                        textProperty: h.TextProperty || null
                    }))
                    : [{
                        dataCommand: obj.History.HistoryEntry.DataCommand ? C4InterfaceCommand.fromXml(obj.History.HistoryEntry.DataCommand) : null,
                        deleteCommand: obj.History.HistoryEntry.DeleteCommand ? C4InterfaceCommand.fromXml(obj.History.HistoryEntry.DeleteCommand) : null,
                        textProperty: obj.History.HistoryEntry.TextProperty || null
                    }];
            } else if (Array.isArray(obj.History)) {
                // JSON structure from UI config
                search.history = obj.History.map((h: any) => ({
                    dataCommand: h.dataCommand ? C4InterfaceCommand.fromXml(h.dataCommand) : null,
                    deleteCommand: h.deleteCommand ? C4InterfaceCommand.fromXml(h.deleteCommand) : null,
                    textProperty: h.textProperty || null
                }));
            }
        }

        return search;
    }
} 