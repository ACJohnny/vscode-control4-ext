import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import C4StateIcon from './C4StateIcon';
import { cleanXmlArray } from '../utility';
import { C4PathTemplates } from './C4NavigatorDisplayOption';

@jsonObject
export class C4DisplayIcons {
    @jsonArrayMember(C4InterfaceIcon)
    defaults: C4InterfaceIcon[]

    @jsonMember(C4InterfaceIcon) 
    states?: {[key:string]: C4InterfaceIcon[]}

    constructor(options?) {
        if (options) {
            this.defaults = options.default_icons.map((v) => { return new C4InterfaceIcon(v)} );
            this.states = {}
            
            if (options.state_icons) {
                // Handle states as array of objects with id/icons properties (from schema)
                if (Array.isArray(options.state_icons)) {
                    options.state_icons.forEach((stateObj: any, index: number) => {
                        this.states[stateObj.id] = [];
                        
                        if (stateObj.icons && Array.isArray(stateObj.icons)) {
                            stateObj.icons.forEach((d: C4InterfaceIcon) => {
                                this.states[stateObj.id].push(new C4InterfaceIcon(d))
                            })
                        }
                    })
                } else {
                    // Handle states as object with string keys (backward compatibility)
                    Object.entries(options.states).forEach((v: any) => {
                        this.states[v[0]] = [];

                        // Check if v[1] is an object with icons property or direct array
                        const iconsArray = v[1].icons || v[1];
                        
                        if (Array.isArray(iconsArray)) {
                            iconsArray.forEach((d: C4InterfaceIcon) => {
                                this.states[v[0]].push(new C4InterfaceIcon(d))
                            })
                        }
                    })
                }
            }
        }
    }

    toXml() {
        let node = builder.create("display_icons").root();

        if (this.defaults) {
            this.defaults.forEach((d) => {
                if (d.sizes) {
                    d.sizes.forEach((size) => {
                        node.import(d.toXml(size))
                    })
                    
                } else {
                    node.import(d.toXml())
                }
            })
        }

        if (this.states) {
            Object.entries(this.states).forEach((state) => {
                let s = node.ele("state", { id: state[0]});

                state[1].forEach((d) => {
                    if (d.sizes) {
                        d.sizes.forEach((size) => {
                            s.import(d.toXml(size))
                        })
                        
                    } else {
                        s.import(d.toXml())
                    }
                })
            })
        }

        return node;
    }

    static fromXml(value: any): C4DisplayIcons {
        let option = new C4DisplayIcons();
            option.states = {}

        let defaults = cleanXmlArray(value.display_icons, "Icon")
        let states = cleanXmlArray(value.display_icons, "state")

        option.defaults = defaults ? defaults.map((d) => {           
            return C4InterfaceIcon.fromXml(d)
        }) : [];

        if (states) {
            states.forEach((s) => {
                let state = C4StateIcon.fromXml(s)
                option.states[state.Id] = state.Icons
            })
        }

        return option
    }

    static fromInterface(default_icons ?: any, state_icons ?: any, path: string = C4PathTemplates.C4ROOT_PATH + C4PathTemplates.ICON_PATH): C4DisplayIcons {
        let display_icons = new C4DisplayIcons();
            display_icons.states = {}

        display_icons.defaults = default_icons ? default_icons.map((d) => {
            let dpath = path.replace(/%RELPATH%/gi, d.relpath || "icons/device").replace(/%ICONFILENAME%/gi, d.id);
            return <C4InterfaceIcon>{ path: dpath, sizes: d.sizes }
        }) : [];

        if (state_icons) {
            state_icons.forEach((s) => {
                let state = C4StateIcon.fromInterface(s, path)
                display_icons.states[state.Id] = state.Icons
            })
        }

        // Explore allowing multiple single State Icon entries with same state value.
/*         let countList: {count:number} = state_icons.reduce(function(p, c){
            p[c.iconstate] = (p[c.iconstate] || 0) + 1;
            return p;
          }, {});
        console.log(countList);
        Object.entries(countList).forEach(([key, count]) => {
            if (count > 1) {
                console.log(key, count);
            }
            
        });
        let result = state_icons.filter(function(obj){
            return countList[obj.iconstate] > 1;
          });

        console.log(result); */

        return display_icons
    }
}