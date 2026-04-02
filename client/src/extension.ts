'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PropertyNodeProvider } from './providers/tree/PropertyNodeProvider';
import { EventNodeProvider } from './providers/tree/EventNodeProvider';
import { CommandNodeProvider } from './providers/tree/CommandNodeProvider';
import { ActionNodeProvider } from './providers/tree/ActionNodeProvider';
import { ConnectionNodeProvider } from './providers/tree/ConnectionNodeProvider';
import { UINodeProvider } from './providers/tree/UINodeProvider';
import { NavDisplayOptionNodeProvider } from './providers/tree/NavDisplayOptionNodeProvider';
import { DashboardNodeProvider } from './providers/tree/DashboardNodeProvider';


import * as path from 'path';
import { workspace } from 'vscode';
import { control4Create, control4Import, rebuildTestDependencies } from './commands';

import {
  ActionsResource, 
  CommandsResource,
  ConnectionsResource,
  EventsResource,
  PropertiesResource,
  NavDisplayOptionsResource,
  SearchResource
} from './components'
import { DashboardResource } from './components/DashboardResource'

import './autocomplete/actions'
import './autocomplete/properties'
import './autocomplete/commands'

import { Views, Commands } from './constants/tree';

import { Control4BuildTaskProvider } from './build/control4BuildTaskProvider'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { PanelManager } from './panel/PanelManager';


function Register(context: vscode.ExtensionContext, disposables: vscode.Disposable[]) {
  disposables.forEach(function (d) {
    context.subscriptions.push(d);
  });
}

async function openUISourceFile(element: any) {
  try {
    const uiFilePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', 'ui.c4c');
    
    // Open the UI file
    const document = await vscode.workspace.openTextDocument(uiFilePath);
    const editor = await vscode.window.showTextDocument(document);
    
    // Parse the JSON to find the item
    const content = document.getText();
    const uiData = JSON.parse(content);
    
    // Find the item in the JSON
    const itemPath = findItemInUI(uiData, element);
    
    if (itemPath) {
      // Navigate to the item
      const position = new vscode.Position(itemPath.line, itemPath.character);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error opening UI source file: ${error.message}`);
  }
}

function findItemInUI(uiData: any, element: any): { line: number; character: number } | null {
  const jsonString = JSON.stringify(uiData, null, 2);
  const lines = jsonString.split('\n');
  
  // Get the search term based on the element type and data
  let searchTerm = '';
  let searchKey = '';
  
  // Handle different types of elements
  if (element.data && element.data.type) {
    switch (element.data.type) {
      case 'Icons':
        searchKey = 'icons';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].id || 'icons';
        }
        break;
      case 'Screens':
        searchKey = 'screens';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].id || 'screens';
        }
        break;
      case 'Tabs':
        searchKey = 'tabs';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].name || 'tabs';
        }
        break;
      case 'Actions':
        searchKey = 'actions';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].id || 'actions';
        }
        break;
      case 'Search':
        searchKey = 'search';
        searchTerm = 'search';
        break;
      case 'Notifications':
        searchKey = 'notifications';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].id || 'notifications';
        }
        break;
      case 'Dashboard':
        searchKey = 'dashboard';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].id || 'dashboard';
        }
        break;
      case 'NowPlaying':
        searchKey = 'nowPlaying';
        searchTerm = 'nowPlaying';
        break;
      case 'Screen':
        searchKey = 'screens';
        if (element.data.item) {
          searchTerm = element.data.item.id || element.data.item.name;
        }
        break;
      case 'Tab':
        searchKey = 'tabs';
        if (element.data.item) {
          searchTerm = element.data.item.name;
        }
        break;
      case 'Action':
        searchKey = 'actions';
        if (element.data.item) {
          searchTerm = element.data.item.id;
        }
        break;
      case 'Notification':
        searchKey = 'notifications';
        if (element.data.item) {
          searchTerm = element.data.item.id;
        }
        break;
      case 'Transport':
        searchKey = 'dashboard';
        if (element.data.item) {
          searchTerm = element.data.item.id;
        }
        break;
      case 'SearchFilters':
        searchKey = 'filters';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0].id;
        }
        break;
      case 'SearchHistory':
        searchKey = 'history';
        searchTerm = 'history';
        break;
      case 'NowPlayingActions':
        searchKey = 'actions';
        if (element.data.items && element.data.items.length > 0) {
          searchTerm = element.data.items[0];
        }
        break;
      case 'NowPlayingList':
        searchKey = 'list';
        searchTerm = 'list';
        break;
      default:
        searchKey = element.data.type || '';
        searchTerm = element.label || element.data.type;
    }
  } else if (element.label) {
    // Handle TextNode elements that have a label
    searchTerm = element.label;
    
    // Try to determine the section based on the label or context
    if (element.label.toLowerCase().includes('icon')) {
      searchKey = 'icons';
    } else if (element.label.toLowerCase().includes('screen')) {
      searchKey = 'screens';
    } else if (element.label.toLowerCase().includes('tab')) {
      searchKey = 'tabs';
    } else if (element.label.toLowerCase().includes('action')) {
      searchKey = 'actions';
    } else if (element.label.toLowerCase().includes('notification')) {
      searchKey = 'notifications';
    } else if (element.label.toLowerCase().includes('dashboard') || element.label.toLowerCase().includes('transport')) {
      searchKey = 'dashboard';
    } else if (element.label.toLowerCase().includes('search')) {
      searchKey = 'search';
    } else if (element.label.toLowerCase().includes('now playing')) {
      searchKey = 'nowPlaying';
    }
  }
  
  // First try to find the section key
  let sectionLine = -1;
  if (searchKey) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes(`"${searchKey}"`) && line.includes(':')) {
        sectionLine = i;
        break;
      }
    }
  }
  
  // If we found the section, look for the specific item within that section
  if (sectionLine >= 0 && searchTerm) {
    // Look for the item within the section (within the next 100 lines or until we hit another top-level key)
    for (let i = sectionLine + 1; i < Math.min(sectionLine + 100, lines.length); i++) {
      const line = lines[i].trim();
      
      // Stop if we hit another top-level key
      if (line.match(/^"[a-zA-Z]+":/)) {
        break;
      }
      
      // Look for the search term
      if (line.includes(searchTerm)) {
        return { line: i, character: lines[i].indexOf(searchTerm) };
      }
    }
  }
  
  // Fallback: search the entire file
  if (searchTerm) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return { line: i, character: lines[i].indexOf(searchTerm) };
      }
    }
  }
  
  // If we can't find the specific item, at least navigate to the section
  if (sectionLine >= 0) {
    return { line: sectionLine, character: 0 };
  }
  
  return null;
}

let client: LanguageClient;

/**
 * Entry into the extension when activated
 */
export function activate(context: vscode.ExtensionContext) {
  const workspacePath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.path : '';

  // Tree node providers
  const propertiesProvider = new PropertyNodeProvider(workspacePath);
  const eventsProvider = new EventNodeProvider(workspacePath);
  const commandsProvider = new CommandNodeProvider(workspacePath);
  const actionsProvider = new ActionNodeProvider(workspacePath);
  const connectionsProvider = new ConnectionNodeProvider(workspacePath);
  const uiProvider = new UINodeProvider(workspacePath);
  const navdisplayoptionsProvider = new NavDisplayOptionNodeProvider(workspacePath);
  const dashboardProvider = new DashboardNodeProvider(workspacePath);
  const dashboardResource = DashboardResource.getInstance(workspacePath);

  // Register the disposables of the tree node providers
  Register(context, propertiesProvider.register(Views.Properties, Commands.Properties.Select, Commands.Properties.Remove));
  Register(context, eventsProvider.register(Views.Events, Commands.Events.Select, Commands.Events.Remove));
  Register(context, commandsProvider.register(Views.Commands, Commands.Commands.Select, Commands.Commands.Remove));
  Register(context, actionsProvider.register(Views.Actions, Commands.Actions.Select, Commands.Actions.Remove));
  Register(context, connectionsProvider.register(Views.Connections, Commands.Connections.Select, Commands.Connections.Remove));
  Register(context, uiProvider.register(Views.UI, Commands.UI.Select, Commands.UI.Remove));
  Register(context, navdisplayoptionsProvider.register(Views.NavDisplayOptions, Commands.NavDisplayOptions.Select, Commands.NavDisplayOptions.Remove));
  Register(context, dashboardProvider.register(Views.Dashboard, Commands.Dashboard.Select, Commands.Dashboard.Remove));
  //Register(context, parametersProvider.register(Views.Parameters, Commands.Parameters.Select, Commands.Parameters.Rmeove))

  // Register the global commands for the extension
  context.subscriptions.push(vscode.commands.registerCommand('control4.activate', () => { }))
  context.subscriptions.push(vscode.commands.registerCommand('control4.rebuildTestDependencies', rebuildTestDependencies, context));
  context.subscriptions.push(vscode.commands.registerCommand('control4.create', async () => {
    const input = await vscode.window.showInputBox();

    await control4Create.apply(context, [vscode.workspace.workspaceFolders[0].uri.fsPath, input])
  }, context));
  context.subscriptions.push(vscode.commands.registerCommand('control4.import', async () => {
    let paths = await vscode.window.showOpenDialog({
      openLabel: 'Select Driver',
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'C4Z': ["c4z", "c4i"]
      }
    });

    if (!paths || paths.length === 0) {
      return;
    }

    let destinationPath : vscode.Uri; 

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >= 1) {
      destinationPath = vscode.workspace.workspaceFolders[0].uri;
    } else {
      const destinationPaths = await vscode.window.showOpenDialog({
        openLabel: 'Select Destination',
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false
      })

      if (!destinationPaths || destinationPaths.length === 0) {
        return;
      }

      destinationPath = destinationPaths[0];
    }

    if (paths && paths.length > 0) {
      await control4Import.apply(context, [paths[0], destinationPath.fsPath])

      vscode.window.showInformationMessage(`Imported ${paths[0].fsPath}`);

      if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        await vscode.commands.executeCommand('vscode.openFolder', destinationPath);
        await vscode.workspace.openTextDocument('./src/driver.lua');
      }
    }
  }, context));

  context.subscriptions.push(vscode.tasks.registerTaskProvider(Control4BuildTaskProvider.BuildType, new Control4BuildTaskProvider(workspacePath, context)));

  let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] }
    }
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    markdown: { isTrusted: true },
    documentSelector: [{ scheme: 'file', language: 'lua' }],
    synchronize: {
      // Notify the server about file changes to '.c4c' files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/**.c4c')
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'vscode-control4-server',
    'Control4 Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  let types = [
    { name: "Property", plural: "Properties", resource: PropertiesResource, provider: propertiesProvider, panel: undefined },
    { name: "Action", plural: "Actions", resource: ActionsResource, provider: actionsProvider, panel: undefined },
    { name: "Command", plural: "Commands", resource: CommandsResource, provider: commandsProvider, panel: undefined },
    { name: "Event", plural: "Events", resource: EventsResource, provider: eventsProvider, panel: undefined},
    { name: "Connection", plural: "Connections", resource: ConnectionsResource, provider: connectionsProvider, panel: undefined },
    { name: "NavDisplayOption", plural: "NavDisplayOptions", resource: NavDisplayOptionsResource, provider: navdisplayoptionsProvider, panel: undefined },
    { name: "Search", plural: "Search", resource: SearchResource, provider: undefined, panel: undefined },
    { name: "UI", plural: "UI", resource: undefined, provider: uiProvider, panel: undefined },
    { name: "Dashboard", plural: "Dashboard", resource: undefined, provider: dashboardProvider, panel: undefined }

  ]

  types.forEach(t => {
    if (t.resource) {
      t.panel = new PanelManager(context.extensionUri, `${t.name.toLowerCase()}.js`, t.name, t.resource)

      //@ts-ignore
      if (t.provider) {
        t.provider.onSelectNode((e) => { vscode.commands.executeCommand(`control4.view${t.name}`, e); })
        t.provider.onRemoveNode((e) => { vscode.commands.executeCommand(`control4.remove${t.name}`, e); })
      }

      context.subscriptions.push(vscode.commands.registerCommand(`control4.add${t.name}`, () => {
        t.panel.createOrShow(context.extensionUri, null);
      }))

      context.subscriptions.push(
        vscode.commands.registerCommand(`control4.view${t.name}`, (e) => {
          t.panel.createOrShow(context.extensionUri, e);
        })
      );

      vscode.window.registerWebviewPanelSerializer(`control4.${t.name.toLowerCase()}`, {
        async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
          t.panel.revive(webviewPanel, context.extensionUri);
        }
      })

      context.subscriptions.push(vscode.commands.registerCommand(`control4.move${t.name}Up`, (n) => {
        t.resource.MoveUp(n.data);
        if (t.provider) {
          t.provider.refresh();
        }
      }));

      context.subscriptions.push(vscode.commands.registerCommand(`control4.move${t.name}Down`, (n) => {
        t.resource.MoveDown(n.data);
        if (t.provider) {
          t.provider.refresh();
        }
      }));

      context.subscriptions.push(vscode.commands.registerCommand(`control4.refresh${t.plural}`, () => {
        if (t.provider) {
          t.provider.refresh();
        }
        t.resource.Reload();
      }));

      // [ ] - When a node is removed from the tree the Webview panel should either be disposed or updated to another exisitng node.
      context.subscriptions.push(vscode.commands.registerCommand(`control4.remove${t.name}`, (n) => {
        t.resource.Delete(n);
        if (t.provider) {
          t.provider.refresh();
        }
      }));
    } else {
      // Handle dashboard specifically since it doesn't have a resource
      if (t.name === "Dashboard") {
        //@ts-ignore
        if (t.provider) {
          t.provider.onSelectNode((e) => { vscode.commands.executeCommand(`control4.view${t.name}`, e); })
          t.provider.onRemoveNode((e) => { vscode.commands.executeCommand(`control4.remove${t.name}`, e); })
        }

        context.subscriptions.push(vscode.commands.registerCommand(`control4.refresh${t.plural}`, () => {
          if (t.provider) {
            t.provider.refresh();
          }
          dashboardResource.Reload();
        }));

        context.subscriptions.push(vscode.commands.registerCommand(`control4.remove${t.name}`, (n) => {
          dashboardResource.Delete(n.data);
          if (t.provider) {
            t.provider.refresh();
          }
        }));
      }
      
      // Handle UI specifically to open source JSON
      if (t.name === "UI") {
        //@ts-ignore
        if (t.provider) {
          t.provider.onSelectNode((e) => { vscode.commands.executeCommand(`control4.view${t.name}`, e); })
          t.provider.onRemoveNode((e) => { vscode.commands.executeCommand(`control4.remove${t.name}`, e); })
        }

        context.subscriptions.push(vscode.commands.registerCommand(`control4.view${t.name}`, async (e) => {
          await openUISourceFile(e);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(`control4.refresh${t.plural}`, () => {
          if (t.provider) {
            t.provider.refresh();
          }
        }));
      }
    }
  })

  context.subscriptions.push(vscode.commands.registerCommand('control4.restartLanguageServer', async () => {
    try {
      // Stop the current client
      if (client) {
        await client.stop();
      }
      
      // Start the client again
      client.start();
      
      vscode.window.showInformationMessage('Control4 Language Server restarted successfully');
    } catch (error) {
      vscode.window.showErrorMessage('Failed to restart language server: ' + error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('control4.reloadExtension', async () => {
    try {
      await vscode.commands.executeCommand('workbench.action.reloadWindow');
    } catch (error) {
      vscode.window.showErrorMessage('Failed to reload extension: ' + error.message);
    }
  }));
}

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}