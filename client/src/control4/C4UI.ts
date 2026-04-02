import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './interface/C4InterfaceCommand';
import C4InterfaceIcons from './interface/C4InterfaceIcons';
import C4InterfaceScreen from './interface/C4InterfaceScreen';
import C4InterfaceTab from './interface/C4InterfaceTab';
import C4InterfaceAction from './interface/C4InterfaceAction';
import { C4InterfaceTransport } from './interface/C4InterfaceTransport';
import C4InterfaceNotification from './interface/C4InterfaceNotification';
import C4InterfaceSearch from './interface/C4InterfaceSearch';
import { C4InterfaceFavoriteCommand } from './interface/C4InterfaceFavoriteCommand';

import { asInt } from "./utility"

@jsonObject
export class C4NowPlayingIsHeader {
    @jsonMember
    property: string

    @jsonArrayMember(String)
    values: string[]
}

@jsonObject
export class C4NowPlayingList {
    @jsonMember
    defaultAction?: string

    @jsonMember
    defaultItemAction?: string

    @jsonMember
    itemDefaultActionProperty?: string

    @jsonMember
    itemActionIdsProperty?: string

    @jsonMember
    titleProperty?: string

    @jsonMember
    subtitleProperty?: string

    @jsonMember
    imageProperty?: string

    @jsonMember
    lengthProperty?: string

    @jsonMember
    isHeader?: C4NowPlayingIsHeader
}

@jsonObject
export class C4NowPlaying {
    @jsonArrayMember(String)
    actions: string[]

    @jsonMember
    actionIdsProperty: string

    @jsonMember
    list: C4NowPlayingList
}

@jsonObject
export class C4UI {
    @jsonMember
    proxybindingid: number

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
    nowPlaying: C4NowPlaying

    @jsonArrayMember(C4InterfaceAction)
    actions: C4InterfaceAction[]

    @jsonMember
    search: C4InterfaceSearch

    @jsonArrayMember(C4InterfaceNotification)
    notifications: C4InterfaceNotification[];

    @jsonArrayMember(C4InterfaceTransport)
    dashboard: C4InterfaceTransport[]

    @jsonMember
    favoriteCommand: C4InterfaceFavoriteCommand

    constructor() {
        this.icons = [];
        this.screens = [];
        this.tabs = [];
        this.actions = [];
        this.notifications = [];
        this.dashboard = [];
    }

    toXml(parentNode?: any) {
        console.log(`[C4UI] Starting toXml for UI with proxybindingid: ${this.proxybindingid}, deviceIcon: ${this.deviceIcon}, brandingIcon: ${this.brandingIcon}`);
        console.log(`[C4UI] Icons count: ${this.icons ? this.icons.length : 0}`);
        console.log(`[C4UI] Screens count: ${this.screens ? this.screens.length : 0}`);
        console.log(`[C4UI] Tabs count: ${this.tabs ? this.tabs.length : 0}`);
        console.log(`[C4UI] Actions count: ${this.actions ? this.actions.length : 0}`);
        
        let node: any;
        if (parentNode) {
            node = parentNode.ele("UI");
        } else {
            node = builder.create("UI").root();
        }

        // Add proxy binding if present
        if (this.proxybindingid) {
            console.log(`[C4UI] Adding proxy binding: ${this.proxybindingid}`);
            node.att("proxybindingid", this.proxybindingid.toString());
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
        if (this.nowPlaying) {
            console.log(`[C4UI] Adding now playing section`);
            let nowPlaying = node.ele("NowPlaying");
            
            if (this.nowPlaying.actions) {
                console.log(`[C4UI] Adding ${this.nowPlaying.actions.length} actions`);
                let actionIds = nowPlaying.ele("ActionIds");
                actionIds.txt(this.nowPlaying.actions.join(" "));
            }

            if (this.nowPlaying.actionIdsProperty) {
                console.log(`[C4UI] Adding action IDs property: ${this.nowPlaying.actionIdsProperty}`);
                nowPlaying.ele("ActionIdsProperty").txt(this.nowPlaying.actionIdsProperty);
            }

            if (this.nowPlaying.list) {
                console.log(`[C4UI] Adding now playing list`);
                let list = nowPlaying.ele("List");
                
                if (this.nowPlaying.list.defaultAction) {
                    list.ele("DefaultAction").txt(this.nowPlaying.list.defaultAction);
                }
                
                if (this.nowPlaying.list.defaultItemAction) {
                    list.ele("DefaultItemAction").txt(this.nowPlaying.list.defaultItemAction);
                }
                
                if (this.nowPlaying.list.itemDefaultActionProperty) {
                    list.ele("ItemDefaultActionProperty").txt(this.nowPlaying.list.itemDefaultActionProperty);
                }
                
                if (this.nowPlaying.list.itemActionIdsProperty) {
                    list.ele("ItemActionIdsProperty").txt(this.nowPlaying.list.itemActionIdsProperty);
                }
                
                if (this.nowPlaying.list.titleProperty) {
                    list.ele("TitleProperty").txt(this.nowPlaying.list.titleProperty);
                }
                
                if (this.nowPlaying.list.subtitleProperty) {
                    list.ele("SubTitleProperty").txt(this.nowPlaying.list.subtitleProperty);
                }
                
                if (this.nowPlaying.list.imageProperty) {
                    list.ele("ImageProperty").txt(this.nowPlaying.list.imageProperty);
                }
                
                if (this.nowPlaying.list.lengthProperty) {
                    list.ele("LengthProperty").txt(this.nowPlaying.list.lengthProperty);
                }
                
                if (this.nowPlaying.list.isHeader) {
                    let isHeader = list.ele("IsHeader");
                    isHeader.ele("Property").txt(this.nowPlaying.list.isHeader.property);
                    if (this.nowPlaying.list.isHeader.values) {
                        let validValues = isHeader.ele("ValidValues");
                        this.nowPlaying.list.isHeader.values.forEach((value: string) => {
                            validValues.ele("Value").txt(value);
                        });
                    }
                }
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
                
                if (action.iconId) {
                    actionNode.ele("IconId").txt(action.iconId);
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
                        
                        if (filter.iconId) {
                            filterNode.ele("IconId").txt(filter.iconId);
                        }
                        
                        if (filter.validValues && filter.validValues.length > 0) {
                            let validValues = filterNode.ele("ValidValues");
                            filter.validValues.forEach((value: string) => {
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
                    let filterNode = filters.ele("SearchFilter");
                    filterNode.ele("Id").txt(filter.id);
                    filterNode.ele("Name").txt(filter.name);
                    filterNode.ele("ScreenId").txt(filter.screenId);
                });
            }

            if (this.search.history && this.search.history.length > 0) {
                let history = search.ele("History");
                // Take the first history entry for the DataCommand and TextProperty
                const entry = this.search.history[0];
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
        }

        // Add notifications if present
        if (this.notifications && this.notifications.length > 0) {
            let notifications = node.ele("DriverNotifications");
            this.notifications.forEach(notification => {
                if (notification && typeof notification.toXml === 'function') {
                    notifications.import(notification.toXml());
                }
            });
        }

        // Add dashboard if present
        if (this.dashboard && this.dashboard.length > 0) {
            console.log(`[C4UI] Adding ${this.dashboard.length} dashboard items`);
            let dashboard = node.ele("Dashboard");
            this.dashboard.forEach((transport, index) => {
                console.log(`[C4UI] Processing transport ${index}:`, transport);
                if (transport && typeof transport.toXml === 'function') {
                    console.log(`[C4UI] Calling toXml on transport ${index}`);
                    transport.toXml(dashboard);
                } else {
                    console.log(`[C4UI] Transport ${index} is invalid or missing toXml method`);
                }
            });
        }

        // Add favorite command if present
        if (this.favoriteCommand && typeof this.favoriteCommand.toXml === 'function') {
            console.log(`[C4UI] Adding favorite command`);
            this.favoriteCommand.toXml(node);
        }

        console.log(`[C4UI] Completed toXml, returning node`);
        return node;
    }

    static fromXml(obj): C4UI {
        let ui = new C4UI();

        ui.deviceIcon = obj.DeviceIcon;
        ui.brandingIcon = obj.BrandingIcon;
        ui.proxybindingid = asInt(obj["@proxybindingid"]);

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

        if (obj.Dashboard && obj.Dashboard.Transport) {
            ui.dashboard = obj.Dashboard.Transport.map(function (t) {
                return C4InterfaceTransport.fromXml(t)
            })
        }

        if (obj.Search) {
            ui.search = C4InterfaceSearch.fromXml ? C4InterfaceSearch.fromXml(obj.Search) : obj.Search;
        }

        if (obj.Actions && obj.Actions.Action) {
            ui.actions = obj.Actions.Action.map(function (a) {
                return C4InterfaceAction.fromXml ? C4InterfaceAction.fromXml(a) : a;
            });
        }

        if (obj.DriverNotifications && obj.DriverNotifications.Notification) {
            ui.notifications = obj.DriverNotifications.Notification.map(function (n) {
                return C4InterfaceNotification.fromXml ? C4InterfaceNotification.fromXml(n) : n;
            });
        }

        if (obj.FavoriteCommand) {
            ui.favoriteCommand = C4InterfaceFavoriteCommand.fromXml ? C4InterfaceFavoriteCommand.fromXml(obj.FavoriteCommand) : obj.FavoriteCommand;
        }

        return ui
    }
}