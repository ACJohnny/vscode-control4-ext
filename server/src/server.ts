/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  SignatureHelp,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  WorkDoneProgressReporter,
  InitializeResult,
  CompletionItemTag,
  SignatureHelpParams,
  CancellationToken,
  ResultProgressReporter,
  SignatureHelpTriggerKind,
  Hover,
  HoverParams,
  ParameterInformation,
  CompletionParams,
  CompletionTriggerKind,
  InsertTextFormat,
  FileChangeType,
  MarkupContent,
  MarkupKind
} from 'vscode-languageserver/node';

import {
  Suggestions,
  Components
} from './c4'

import {
  TextDocument
} from 'vscode-languageserver-textdocument';

import { UIValidationService } from './validation';

//import * as h from './resources/hooks';
import functions from './resources/functions.json';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
let workspaceRoot: string;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [":", ".", ",", "("]
      },
      signatureHelpProvider: {
        triggerCharacters: ["(", ","]
      },
      hoverProvider: true,
      workspace: {
        workspaceFolders: {
          supported: true
        }
      }
    }
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }

  if (params.workspaceFolders && params.workspaceFolders[0]) {
    workspaceRoot = params.workspaceFolders[0].uri;

    connection.console.log(params.workspaceFolders[0].uri);
  } else {
    connection.console.log("No workspace folder")
  }
  
  return result;
});

connection.onInitialized(() => {
  Components.Initialize(workspaceRoot);

  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'languageServerExample'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // Check if this is a UI file
  if (textDocument.uri.endsWith('ui.c4c')) {
    const validationResult = UIValidationService.validateUIDocument(textDocument);
    
    // Send the computed diagnostics to VSCode
    connection.sendDiagnostics({ 
      uri: textDocument.uri, 
      diagnostics: validationResult.diagnostics 
    });
  }
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  _change.changes.forEach(function(change) {
    Components.Set(change.uri)
  })
});

// Add global variable declarations for Control4
const globalVariables: CompletionItem[] = [
  {
    label: 'C4',
    kind: CompletionItemKind.Variable,
    detail: 'Control4 Global API',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Global Control4 API object providing access to all Control4 driver functions'
    }
  },
  {
    label: 'OnDriverInit',
    kind: CompletionItemKind.Function,
    detail: 'Driver Initialization Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called when the driver is loaded. Initialize all driver objects here.'
    }
  },
  {
    label: 'OnDriverLateInit',
    kind: CompletionItemKind.Function,
    detail: 'Post-Project Load Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called after the project is loaded. Use for initialization that requires the project to be fully loaded.'
    }
  },
  {
    label: 'OnDriverDestroyed',
    kind: CompletionItemKind.Function,
    detail: 'Driver Cleanup Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called when the driver is destroyed. Clean up resources here.'
    }
  },
  {
    label: 'OnPropertyChanged',
    kind: CompletionItemKind.Function,
    detail: 'Property Change Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called when a property value changes. Parameter: property name.'
    }
  },
  {
    label: 'OnNetworkBindingChanged',
    kind: CompletionItemKind.Function,
    detail: 'Network Binding Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called when a network connection is addressed or unaddressed.'
    }
  },
  {
    label: 'OnDriverRemovedFromProject',
    kind: CompletionItemKind.Function,
    detail: 'Driver Removal Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called when the driver is removed from a project.'
    }
  },
  {
    label: 'OnEndDebugSession',
    kind: CompletionItemKind.Function,
    detail: 'Debug Session Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Called when remote debugging of the DriverWorks script has ended.'
    }
  },
  {
    label: 'OnError',
    kind: CompletionItemKind.Function,
    detail: 'Error Handler Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Sets a callback method that will be called when an error occurs during an asynchronous operation.'
    }
  },
  {
    label: 'OnListen',
    kind: CompletionItemKind.Function,
    detail: 'Listen Hook',
    documentation: {
      kind: MarkupKind.Markdown,
      value: 'Sets a callback method that will be called once the TCP server starts listening.'
    }
  }
];

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (params: CompletionParams): CompletionItem[] => {
    let document = documents.get(params.textDocument.uri);
    let position = params.position;

    let items : CompletionItem[] = [];

    // Handle screenId completion for UI files
    if (document && document.uri.endsWith('ui.c4c')) {
      const text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });
      
      // Check if we're in a screenId field
      if (text.includes('"screenId"') || text.includes('screenId')) {
        try {
          const validationResult = UIValidationService.validateUIDocument(document);
          const screenIdSuggestions = UIValidationService.getScreenIdSuggestions(validationResult.validScreenIds);
          
          const screenIdItems: CompletionItem[] = screenIdSuggestions.map(screenId => ({
            label: screenId,
            kind: CompletionItemKind.Value,
            detail: 'Screen ID',
            documentation: {
              kind: MarkupKind.Markdown,
              value: `Screen ID: ${screenId}`
            }
          }));
          
          items.push(...screenIdItems);
        } catch (error) {
          console.warn('Failed to provide screenId completions:', error);
        }
      }
    }

    // Provide global variable suggestions for Control4
    if (!params.context?.triggerCharacter) {
      const text = document?.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } }) || '';
      
      // If user is typing "C4" or similar, suggest the C4 global
      if (text.match(/C4\s*$/i)) {
        items.push({
          label: 'C4',
          kind: CompletionItemKind.Variable,
          detail: 'Control4 Global API',
          documentation: {
            kind: MarkupKind.Markdown,
            value: 'Global Control4 API object providing access to all Control4 driver functions'
          },
          insertText: 'C4'
        });
      }
      
      // Provide global variable suggestions at the beginning of lines or after certain patterns
      const lineText = document?.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } }) || '';
      const isAtLineStart = lineText.trim().length === 0;
      const isAfterFunction = lineText.match(/function\s*$/);
      const isAfterLocal = lineText.match(/local\s*$/);
      const isAfterEnd = lineText.match(/end\s*$/);
      const isAfterThen = lineText.match(/then\s*$/);
      const isAfterElse = lineText.match(/else\s*$/);
      const isAfterDo = lineText.match(/do\s*$/);
      
      // More aggressive global variable suggestions
      if (isAtLineStart || isAfterFunction || isAfterLocal || isAfterEnd || isAfterThen || isAfterElse || isAfterDo || text.length < 3) {
        items.push(...globalVariables);
      }
      
      // Also provide globals when typing common Control4 patterns
      if (text.match(/OnDriver/i) || text.match(/OnProperty/i) || text.match(/OnNetwork/i)) {
        items.push(...globalVariables.filter(v => v.label.toLowerCase().includes(text.toLowerCase())));
      }
    }

    if (params.context?.triggerCharacter == ":") {
      if (document) {
        // Search for the function name
        let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });
  
        // Find the Control4 function call
        let results = new RegExp(/C4:/, "i").exec(text);
  
        if (!results) {
          return [];
        }
      }

      let fs : CompletionItem[] = functions.map((func: any, index: number) => {
        let documentation : MarkupContent = {
          kind: MarkupKind.Markdown,
          value: func.description
        }

        let item : CompletionItem = {
          label: func.label,
          kind: CompletionItemKind.Function,
          data: index,
          detail: func.version,
          documentation: documentation,
        }

        return item;
      })
  
      items.push(...fs);
    }

    if (params.context?.triggerCharacter == "," || params.context?.triggerCharacter == "(") {{
      // Search for the function name
      if (document) {
        let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });

        // Find the Control4 function call
        let results = new RegExp(/C4:([^ ()]+)\(?([^()]+)*\)*?/, "i").exec(text);

        let index = 0;

        // SendToProxy
        if (results) {
          let values = [];
          
          if (results[2]) {
            index = (results[2].match(/,/g) || []).length;  

            for (let i = 2; i < results.length; i++) {
                let matches = results[i].match(/(.*),/);
                values.push(matches[1]);
            }
          } 
          
          items.push(...Suggestions.Get(results[1], index, values));
        }
      }
    }}

    return items;
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.kind == CompletionItemKind.Function) {  
      if (functions[item.data].deprecated) {
        item.tags = [CompletionItemTag.Deprecated]
      }
  
      return item;
    } else {
      return item;
    }
  }
);

connection.onSignatureHelp((params: SignatureHelpParams, token: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress: ResultProgressReporter<never> | undefined): SignatureHelp | null => {
  let document = documents.get(params.textDocument.uri);
  let position = params.position;

  if (document) {
    // Search for the function name
    let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });

    // Find the Control4 function call
    let results = new RegExp(/C4:([^ ()]+)\(?([^()]+)*\)*?/, "i").exec(text);

    if (results) {
      let f = null;
      // Retrieve function details
      for (let i = 0; i < functions.length; i++) {
        if (functions[i].label == results[1]) {
          f = functions[i];

          break;
        }
      }

      if (f) {
        let parameters = f.parameters?.map((p: any) => {
          let param : ParameterInformation = {
            label: p.name,
            documentation: p.description
          }

          return param
        })

        let index = 0

        if (results[2]) {
          index = (results[2].match(/,/g) || []).length;
        }

        return {
          activeParameter: index,
          activeSignature: 0,
          signatures: [{
            label: f.signature,
            documentation: {
              kind: MarkupKind.Markdown,
              value: f.description
            },
            parameters: parameters,
          }]
        }
      }
    }
  }

  return null;
})

connection.onHover((params: HoverParams) : Hover | null => {
  let document = documents.get(params.textDocument.uri);
  let position = params.position;

  if (document) {
    let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: 65536 } });

    // Check for C4 global object
    let c4Match = new RegExp("\\bC4\\b", "i").exec(text);
    if (c4Match) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: "**C4** - Global Control4 API object\n\nProvides access to all Control4 driver functions including:\n- Property management\n- Event handling\n- Network operations\n- File operations\n- Device communication\n\nUse `C4:` to access functions (e.g., `C4:UpdateProperty`)"
        }
      };
    }

    // Check for Control4 hooks
    let hookMatch = new RegExp("\\b(OnDriverInit|OnDriverLateInit|OnDriverDestroyed|OnPropertyChanged|OnNetworkBindingChanged)\\b", "i").exec(text);
    if (hookMatch) {
      const hookName = hookMatch[1];
      const hookDocs = {
        OnDriverInit: "**OnDriverInit()** - Called when the driver is loaded. Initialize all driver objects here.",
        OnDriverLateInit: "**OnDriverLateInit()** - Called after the project is loaded. Use for initialization that requires the project to be fully loaded.",
        OnDriverDestroyed: "**OnDriverDestroyed()** - Called when the driver is destroyed. Clean up resources here.",
        OnPropertyChanged: "**OnPropertyChanged(strName)** - Called when a property value changes.",
        OnNetworkBindingChanged: "**OnNetworkBindingChanged(idBinding, bIsBound)** - Called when a network connection is addressed or unaddressed."
      };
      
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: hookDocs[hookName] || `**${hookName}** - Control4 driver hook function`
        }
      };
    }

    // Find the Control4 function call.
    let results = new RegExp("C4:(.+?)\\s*\\(", "i").exec(text);
  
    if (results) {
      let f = null;
      // Retrieve function details
      for (let i = 0; i < functions.length; i++) {
        if (functions[i].label == results[results.length - 1]) {
          f = functions[i];
  
          break;
        }
      }
  
      if (f) {
        let parameters = f.parameters?.map((p: any) => {
          let param : ParameterInformation = {
            label: p,
            documentation: p
          }
          return param
        })
  
        return {
          contents: f.description
        }
      }
    }
  }

  return null;
})

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

// The content of a text document has been saved. This event is emitted
// when the text document is saved to disk.
documents.onDidSave(change => {
  validateTextDocument(change.document);
});

// The content of a text document has been opened. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidOpen(change => {
  validateTextDocument(change.document);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();