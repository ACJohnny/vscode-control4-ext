import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';

@jsonObject
export default class C4InterfaceFilter {
    @jsonMember
    type: string;

    @jsonMember
    property: string;

    @jsonMember
    name?: string;

    @jsonMember
    iconId?: string;

    @jsonArrayMember(String)
    validValues?: string[];

    constructor(options?: any) {
        if (options) {
            this.type = options.type;
            this.property = options.property;
            this.name = options.name;
            this.iconId = options.iconId;
            this.validValues = options.validValues || [];
        }
    }
}
