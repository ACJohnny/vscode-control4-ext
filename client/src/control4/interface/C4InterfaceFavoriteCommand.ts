import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

@jsonObject
export class C4InterfaceFavoriteCommand {
    @jsonMember
    name: string

    constructor() {
        this.name = '';
    }

    toXml(parentNode?: any): any {
        let node: any;
        if (parentNode) {
            node = parentNode.ele("FavoriteCommand");
        } else {
            node = builder.create('FavoriteCommand').root();
        }
        
        node.ele("Name").txt(this.name);
        node.ele("Type").txt("PROTOCOL");
        
        let params = node.ele("Params");
        let param = params.ele("Param");
        param.ele("Name").txt("id");
        param.ele("Type").txt("FIRST_SELECTED");
        param.ele("Value").txt("favoriteId");
        
        return node;
    }

    static fromXml(obj: any): C4InterfaceFavoriteCommand {
        let favoriteCommand = new C4InterfaceFavoriteCommand();
        
        if (obj.Name) {
            favoriteCommand.name = obj.Name;
        }
        
        return favoriteCommand;
    }
}
