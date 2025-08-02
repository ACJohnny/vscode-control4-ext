import * as vscode from 'vscode';
import * as path from 'path';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4UI } from '../../control4';
import { TypedJSON } from 'typedjson';
import UINode from './UINode';
import FolderNode from "./FolderNode"
import TextNode from './TextNode';
import C4InterfaceIcons from '../../control4/interface/C4InterfaceIcons';
import C4InterfaceScreen from '../../control4/interface/C4InterfaceScreen';
import C4InterfaceTab from '../../control4/interface/C4InterfaceTab';
import C4InterfaceCommand from '../../control4/interface/C4InterfaceCommand';
import { C4InterfaceTransport } from '../../control4/interface/C4InterfaceTransport';
import C4InterfaceAction from '../../control4/interface/C4InterfaceAction';
import C4InterfaceNotification from '../../control4/interface/C4InterfaceNotification';
import C4InterfaceSearch from '../../control4/interface/C4InterfaceSearch';

export class UINodeProvider extends TreeNodeProvider<UINode> {
    private _componentPath: string

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'ui.c4c');

        this.watchFile('ui.c4c');
    }

    protected onSelect(element: any) {
        // Call the parent onSelect to maintain the event flow
        super.onSelect(element);
        
        // Additionally handle UI node selection by opening the source file
        if (element && (element.data || element.label)) {
            // Execute the viewUI command which will handle opening the source file
            vscode.commands.executeCommand('control4.viewUI', element);
        }
    }

    getChildren(element?: FolderNode): Thenable<FolderNode[]> {
      if (!this.workspaceRoot) {
        vscode.window.showInformationMessage('No dependency in empty workspace');
        return Promise.resolve([]);
      }

      try {
          if (element) {
              var nodes = [];
              
              if (!element.data) {
                return;
              }

              if (element.data.deviceIcon) {
                nodes.push(new FolderNode("Icons", "",  {
                  type: "Icons",
                  items: element.data.icons
                }));
                nodes.push(new FolderNode("Screens", "", {
                  type: "Screens",
                  items: element.data.screens
                }));
                nodes.push(new FolderNode("Tabs", "", {
                  type: "Tabs",
                  items: element.data.tabs,
                  command: element.data.tabCommand
                }));
                if (element.data.actions && element.data.actions.length > 0) {
                  nodes.push(new FolderNode("Actions", "", {
                    type: "Actions",
                    items: element.data.actions
                  }));
                }
                if (element.data.search) {
                  nodes.push(new FolderNode("Search", "", {
                    type: "Search",
                    item: element.data.search
                  }));
                }
                if (element.data.notifications && element.data.notifications.length > 0) {
                  nodes.push(new FolderNode("Notifications", "", {
                    type: "Notifications",
                    items: element.data.notifications
                  }));
                }
                if (element.data.dashboard && element.data.dashboard.length > 0) {
                  nodes.push(new FolderNode("Dashboard", "", {
                    type: "Dashboard",
                    items: element.data.dashboard
                  }));
                }
                if (element.data.nowPlaying) {
                  nodes.push(new FolderNode("Now Playing", "", {
                    type: "NowPlaying",
                    item: element.data.nowPlaying
                  }));
                }
              }

              switch(element.data.type) {
                case 'Icons':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceIcons;

                    nodes.push(new TextNode(e.id, e.template, "file-media", {}));
                  }
                  break;
                case 'Screens':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceScreen;

                    nodes.push(new FolderNode(e.id, e.type, {
                      type: "Screen",
                      item: e
                    }));
                  }
                  break;
                case 'Screen':
                  let e = element.data.item as C4InterfaceScreen;

                  nodes.push(new TextNode(e.dataCommand.name, e.dataCommand.type, "file-media", {
                    item: e
                  }));
                  break;
                case 'Tabs':
                  if (element.data.command) {
                      let e = element.data.command as C4InterfaceCommand
                      nodes.push(new TextNode(e.name, e.type, "code", {
                          type: 'TabCommand',
                          item: element.data.command,
                      }))
                  } else {
                    for (var i = 0; i < element.data.items.length; i++) {
                        let e = element.data.items[i] as C4InterfaceTab;
    
                        nodes.push(new TextNode(e.name, `Screen [${e.screenId}] - Icon [${e.iconId}]`, "list-filter", {
                          type: "Tab",
                          item: e
                        }));
                      }
                  }
                  break;
                case 'Actions':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceAction;

                    nodes.push(new TextNode(e.id, `${e.name} - ${e.command?.name || 'No command'}`, "symbol-method", {
                      type: "Action",
                      item: e
                    }));
                  }
                  break;
                case 'Search':
                  let search = element.data.item as C4InterfaceSearch;
                  if (search.filters && search.filters.length > 0) {
                    nodes.push(new FolderNode("Filters", "", {
                      type: "SearchFilters",
                      items: search.filters
                    }));
                  }
                  if (search.history) {
                    nodes.push(new FolderNode("History", "", {
                      type: "SearchHistory",
                      item: search.history
                    }));
                  }
                  break;
                case 'SearchFilters':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as any;
                    nodes.push(new TextNode(e.id, `${e.name} -> Screen ${e.screen_id}`, "filter", {
                      type: "SearchFilter",
                      item: e
                    }));
                  }
                  break;
                case 'SearchHistory':
                  let history = element.data.item as any;
                  if (history && history.length > 0) {
                    history.forEach((entry: any, index: number) => {
                      if (entry.dataCommand) {
                        nodes.push(new TextNode(`Data Command ${index + 1}`, entry.dataCommand.name, "symbol-method", {
                          type: "SearchHistoryDataCommand",
                          item: entry.dataCommand
                        }));
                      }
                      if (entry.deleteCommand) {
                        nodes.push(new TextNode(`Delete Command ${index + 1}`, entry.deleteCommand.name, "symbol-method", {
                          type: "SearchHistoryDeleteCommand",
                          item: entry.deleteCommand
                        }));
                      }
                      if (entry.textProperty) {
                        nodes.push(new TextNode(`Text Property ${index + 1}`, entry.textProperty, "symbol-field", {
                          type: "SearchHistoryTextProperty",
                          item: entry.textProperty
                        }));
                      }
                    });
                  }
                  break;
                case 'Notifications':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceNotification;

                    nodes.push(new TextNode(e.id, `${e.buttons?.length || 0} buttons`, "bell", {
                      type: "Notification",
                      item: e
                    }));
                  }
                  break;
                case 'NowPlaying':
                  let nowPlaying = element.data.item as any;
                  if (nowPlaying.actions && nowPlaying.actions.length > 0) {
                    nodes.push(new FolderNode("Actions", "", {
                      type: "NowPlayingActions",
                      items: nowPlaying.actions
                    }));
                  }
                  if (nowPlaying.list) {
                    nodes.push(new FolderNode("List", "", {
                      type: "NowPlayingList",
                      item: nowPlaying.list
                    }));
                  }
                  break;
                case 'NowPlayingActions':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as string;
                    nodes.push(new TextNode(e, "Action", "symbol-method", {
                      type: "NowPlayingAction",
                      item: e
                    }));
                  }
                  break;
                case 'NowPlayingList':
                  let list = element.data.item as any;
                  if (list.defaultAction) {
                    nodes.push(new TextNode("Default Action", list.defaultAction, "symbol-method", {
                      type: "NowPlayingListProperty",
                      item: list.defaultAction
                    }));
                  }
                  if (list.titleProperty) {
                    nodes.push(new TextNode("Title Property", list.titleProperty, "symbol-field", {
                      type: "NowPlayingListProperty",
                      item: list.titleProperty
                    }));
                  }
                  if (list.subtitleProperty) {
                    nodes.push(new TextNode("Subtitle Property", list.subtitleProperty, "symbol-field", {
                      type: "NowPlayingListProperty",
                      item: list.subtitleProperty
                    }));
                  }
                  break;
                case 'Dashboard':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceTransport;

                    nodes.push(new TextNode(e.id, `${e.buttonType} - ${e.releaseCommand.name}`, "play-circle", {
                      type: "Transport",
                      item: e
                    }));
                  }
                  break;
              }

              return Promise.resolve(nodes);
          } else {
              return this.getNodes(this._componentPath);
          }
      } catch (err) {
          console.log(err)
      }
  }

    getComponent(ui: C4UI): UINode {
        try {
            return new UINode(ui.proxybindingid?.toString() || "No proxy binding", ui);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
        return TypedJSON.parseAsArray<C4UI>(components, C4UI);
    }

    override async getNodes(component) {
      try {
        let td: vscode.TextDocument = await vscode.workspace.openTextDocument(component);
        let components: C4UI[];
  
        try {
          components = JSON.parse(td.getText());
        } catch (err) {
          vscode.window.showErrorMessage(`Bad JSON in component ${this.file}`, "Show", "Ok").then(value => {
            if (value == "Show") {
              vscode.window.showTextDocument(td);
            }
          });
  
          return [];
        }
  
        if (this.resolveTypes) {
          components = this.resolveTypes(components);
        }

        var ret = [];

        components.forEach((c) => {
          ret.push(this.getComponent(c));
        })

        return ret;
      } catch (err) {
        vscode.window.showErrorMessage(err.message);
      }
    }
}