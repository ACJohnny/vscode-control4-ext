import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './C4InterfaceCommand';

@jsonObject
export class C4InterfaceTransport {
    @jsonMember
    id: string

    @jsonMember
    buttonType: string

    @jsonMember
    name?: string

    @jsonMember
    iconId?: string

    @jsonMember
    releaseCommand: C4InterfaceCommand

    constructor() {
        this.id = '';
        this.buttonType = '';
        this.releaseCommand = new C4InterfaceCommand();
    }

    toXml(parentNode?: any): any {
        let node: any;
        if (parentNode) {
            node = parentNode.ele("Transport");
        } else {
            node = builder.create('Transport').root();
        }
        
        node.ele("Id").txt(this.id);
        node.ele("ButtonType").txt(this.buttonType);
        
        if (this.name) {
            node.ele("Name").txt(this.name);
        }
        
        if (this.iconId) {
            node.ele("IconId").txt(this.iconId);
        }
        
        if (this.releaseCommand) {
            let releaseCommand = node.ele("ReleaseCommand");
            releaseCommand.ele("Name").txt(this.releaseCommand.name);
            releaseCommand.ele("Type").txt(this.releaseCommand.type);
            
            if (this.releaseCommand.params && this.releaseCommand.params.length > 0) {
                let params = releaseCommand.ele("Params");
                this.releaseCommand.params.forEach(param => {
                    let paramNode = params.ele("Param");
                    paramNode.ele("Name").txt(param.name);
                    paramNode.ele("Type").txt(param.type);
                    if (param.value) {
                        paramNode.ele("Value").txt(param.value);
                    }
                });
            }
        }
        
        return node;
    }

    static fromXml(obj: any): C4InterfaceTransport {
        let transport = new C4InterfaceTransport();
        
        transport.id = obj.Id;
        transport.buttonType = obj.ButtonType;
        transport.name = obj.Name;
        transport.iconId = obj.IconId;
        
        if (obj.ReleaseCommand) {
            transport.releaseCommand = C4InterfaceCommand.fromXml(obj.ReleaseCommand);
        }
        
        return transport;
    }
} 