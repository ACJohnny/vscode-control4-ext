import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './interface/C4InterfaceCommand';
import C4InterfaceIcons from './interface/C4InterfaceIcons';
import C4InterfaceScreen from './interface/C4InterfaceScreen';
import C4InterfaceTab from './interface/C4InterfaceTab';
import C4InterfaceAction from './interface/C4InterfaceAction';

import { asInt } from "./utility"

@jsonObject
export class C4UI {
    @jsonMember
    proxy: number

    @jsonMember
    deviceIcon: string

    @jsonMember
    brandingIcon: string

    @jsonMember
    hide_in_list_nav: boolean

    @jsonMember
    hide_in_media: boolean

    @jsonMember
    digital_audio_support: boolean

    @jsonMember
    can_scan_media: boolean

    @jsonMember
    ui_selects_device: boolean

    @jsonArrayMember(C4InterfaceIcons)
    icons: C4InterfaceIcons[]

    @jsonArrayMember(C4InterfaceScreen)
    screens: C4InterfaceScreen[]

    @jsonArrayMember(C4InterfaceTab)
    tabs: C4InterfaceTab[]

    @jsonMember
    tabCommand: C4InterfaceCommand

    @jsonMember
    now_playing: any

    @jsonArrayMember(C4InterfaceAction)
    actions: C4InterfaceAction[]

    @jsonMember
    search: any

    @jsonArrayMember(String)
    notifications: string[]

    @jsonArrayMember(String)
    dashboard: string[]

    constructor() {
        this.icons = [];
        this.screens = [];
        this.tabs = [];
        this.actions = [];
        this.notifications = [];
        this.dashboard = [];
    }

    toXml() {
        console.log(`[C4UI] Starting toXml for UI with proxy: ${this.proxy}, deviceIcon: ${this.deviceIcon}, brandingIcon: ${this.brandingIcon}`);
        console.log(`[C4UI] Icons count: ${this.icons ? this.icons.length : 0}`);
        console.log(`[C4UI] Screens count: ${this.screens ? this.screens.length : 0}`);
        console.log(`[C4UI] Tabs count: ${this.tabs ? this.tabs.length : 0}`);
        console.log(`[C4UI] Actions count: ${this.actions ? this.actions.length : 0}`);
        
        let node = builder.create("UI").root();

        // Add proxy binding if present
        if (this.proxy) {
            console.log(`[C4UI] Adding proxy binding: ${this.proxy}`);
            node.att("proxybindingid", this.proxy.toString());
        }

        // Add the required namespace
        node.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");

        // Add device icon if present
        if (this.deviceIcon) {
            console.log(`[C4UI] Adding device icon: ${this.deviceIcon}`);
            node.ele("DeviceIcon").txt(this.deviceIcon);
        }

        // Add branding icon if present
        if (this.brandingIcon) {
            console.log(`[C4UI] Adding branding icon: ${this.brandingIcon}`);
            node.ele("BrandingIcon").txt(this.brandingIcon);
        }

        // Add icons if present
        if (this.icons && this.icons.length > 0) {
            console.log(`[C4UI] Adding ${this.icons.length} icons`);
            let icons = node.ele("Icons");
            this.icons.forEach((icon, index) => {
                console.log(`[C4UI] Processing icon ${index}:`, icon);
                if (icon && typeof icon.toXml === 'function') {
                    console.log(`[C4UI] Calling toXml on icon ${index}`);
                    icons.import(icon.toXml());
                } else {
                    console.log(`[C4UI] Icon ${index} is invalid or missing toXml method`);
                }
            });
        }

        // Add screens if present
        if (this.screens && this.screens.length > 0) {
            console.log(`[C4UI] Adding ${this.screens.length} screens`);
            let screens = node.ele("Screens");
            this.screens.forEach((screen, index) => {
                console.log(`[C4UI] Processing screen ${index}:`, screen);
                if (screen && typeof screen.toXml === 'function') {
                    console.log(`[C4UI] Calling toXml on screen ${index}`);
                    screens.import(screen.toXml());
                } else {
                    console.log(`[C4UI] Screen ${index} is invalid or missing toXml method`);
                }
            });
        }

        // Add tabs if present
        if (this.tabCommand && typeof this.tabCommand.toXml === 'function') {
            console.log(`[C4UI] Adding tab command`);
            let tabs = node.ele("Tabs");
            tabs.import(this.tabCommand.toXml());
        } else if (this.tabs && this.tabs.length > 0) {
            console.log(`[C4UI] Adding ${this.tabs.length} tabs`);
            let tabs = node.ele("Tabs");
            this.tabs.forEach((tab, index) => {
                console.log(`[C4UI] Processing tab ${index}:`, tab);
                if (tab && typeof tab.toXml === 'function') {
                    console.log(`[C4UI] Calling toXml on tab ${index}`);
                    tabs.import(tab.toXml());
                } else {
                    console.log(`[C4UI] Tab ${index} is invalid or missing toXml method`);
                }
            });
        }

        // Add now playing if present
        if (this.now_playing) {
            console.log(`[C4UI] Adding now playing section`);
            let nowPlaying = node.ele("NowPlaying");
            
            if (this.now_playing.action_ids) {
                console.log(`[C4UI] Adding ${this.now_playing.action_ids.length} action IDs`);
                let actionIds = nowPlaying.ele("ActionIds");
                this.now_playing.action_ids.forEach((actionId: string) => {
                    actionIds.ele("ActionId").txt(actionId);
                });
            }

            if (this.now_playing.list) {
                console.log(`[C4UI] Adding now playing list`);
                let list = nowPlaying.ele("List");
                Object.keys(this.now_playing.list).forEach(key => {
                    if (key === 'is_header' && this.now_playing.list[key]) {
                        let isHeader = list.ele("IsHeader");
                        isHeader.ele("Property").txt(this.now_playing.list[key].property);
                        if (this.now_playing.list[key].valid_values) {
                            let validValues = isHeader.ele("ValidValues");
                            this.now_playing.list[key].valid_values.forEach((value: string) => {
                                validValues.ele("Value").txt(value);
                            });
                        }
                    } else {
                        list.ele(key.charAt(0).toUpperCase() + key.slice(1) + "Property").txt(this.now_playing.list[key]);
                    }
                });
            }
        }

        // Add actions if present
        if (this.actions && this.actions.length > 0) {
            console.log(`[C4UI] Adding ${this.actions.length} actions`);
            let actions = node.ele("Actions");
            this.actions.forEach((action, index) => {
                console.log(`[C4UI] Processing action ${index}:`, action);
                let actionNode = actions.ele("Action");
                actionNode.ele("Id").txt(action.id);
                actionNode.ele("Name").txt(action.name);
                
                if (action.icon_id) {
                    actionNode.ele("IconId").txt(action.icon_id);
                }

                if (action.edit_property) {
                    actionNode.ele("EditProperty").txt(action.edit_property);
                }

                if (action.command) {
                    let command = actionNode.ele("Command");
                    command.ele("Name").txt(action.command.name);
                    command.ele("Type").txt(action.command.type);
                    
                    if (action.command.params) {
                        let params = command.ele("Params");
                        action.command.params.forEach((param: any) => {
                            let paramNode = params.ele("Param");
                            paramNode.ele("Name").txt(param.name);
                            paramNode.ele("Type").txt(param.type);
                            if (param.value) {
                                paramNode.ele("Value").txt(param.value);
                            }
                        });
                    }
                }

                if (action.filters) {
                    let filters = actionNode.ele("Filters");
                    action.filters.forEach((filter: any) => {
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
            });
        }

        // Add search if present
        if (this.search) {
            console.log(`[C4UI] Adding search section`);
            let search = node.ele("Search");
            
            if (this.search.filters) {
                let filters = search.ele("Filters");
                this.search.filters.forEach((filter: any) => {
                    let filterNode = filters.ele("Filter");
                    filterNode.ele("Id").txt(filter.id);
                    filterNode.ele("Name").txt(filter.name);
                    filterNode.ele("ScreenId").txt(filter.screen_id);
                });
            }

            if (this.search.history) {
                let history = search.ele("History");
                this.search.history.forEach((entry: any) => {
                    let entryNode = history.ele("HistoryEntry");
                    if (entry.data_command && typeof entry.data_command.toXml === 'function') {
                        entryNode.import(entry.data_command.toXml());
                    } else if (entry.data_command) {
                        let dataCommand = C4InterfaceCommand.fromXml(entry.data_command);
                        if (dataCommand && typeof dataCommand.toXml === 'function') {
                            entryNode.import(dataCommand.toXml());
                        }
                    }
                    if (entry.delete_command && typeof entry.delete_command.toXml === 'function') {
                        entryNode.import(entry.delete_command.toXml());
                    } else if (entry.delete_command) {
                        let deleteCommand = C4InterfaceCommand.fromXml(entry.delete_command);
                        if (deleteCommand && typeof deleteCommand.toXml === 'function') {
                            entryNode.import(deleteCommand.toXml());
                        }
                    }
                });
            }
        }

        // Add notifications if present
        if (this.notifications && this.notifications.length > 0) {
            console.log(`[C4UI] Adding ${this.notifications.length} notifications`);
            let notifications = node.ele("Notifications");
            this.notifications.forEach(notification => {
                notifications.ele("Notification").txt(notification);
            });
        }

        // Add dashboard if present
        if (this.dashboard && this.dashboard.length > 0) {
            console.log(`[C4UI] Adding ${this.dashboard.length} dashboard items`);
            let dashboard = node.ele("Dashboard");
            this.dashboard.forEach(item => {
                dashboard.ele("DashboardItem").txt(item);
            });
        }

        console.log(`[C4UI] Completed toXml, returning node`);
        return node;
    }

    static fromXml(obj): C4UI {
        let ui = new C4UI();

        ui.deviceIcon = obj.DeviceIcon;
        ui.brandingIcon = obj.BrandingIcon;
        ui.proxy = asInt(obj["@proxybindingid"]);

        ui.icons = obj.Icons.IconGroup.map(function (i) {
            return C4InterfaceIcons.fromXml(i)
        })

        ui.screens = obj.Screens.Screen.map(function (s) {
            return C4InterfaceScreen.fromXml(s)
        })

        if (obj.Tabs && obj.Tabs.Tab) {
            ui.tabs = obj.Tabs.IconGroup.map(function (t) {
                return C4InterfaceTab.fromXml(t)
            })
        } else if (obj.Tabs && obj.Tabs.Command) {
            ui.tabCommand = C4InterfaceCommand.fromXml(obj.Tabs.Command);
        }

        return ui
    }
}