import {
  Diagnostic,
  DiagnosticSeverity,
  TextDocument,
  Range,
  Position
} from 'vscode-languageserver/node';

export interface ValidationResult {
  diagnostics: Diagnostic[];
  validScreenIds: string[];
}

export class UIValidationService {
  
  /**
   * Validates a UI document for cross-reference errors
   */
  public static validateUIDocument(document: TextDocument): ValidationResult {
    const diagnostics: Diagnostic[] = [];
    let validScreenIds: string[] = [];
    
    try {
      const content = document.getText();
      const uiData = JSON.parse(content);
      
      // Extract valid screen IDs from the screens section
      validScreenIds = this.extractScreenIds(uiData);
      
      // Validate screenId references
      const screenIdErrors = this.validateScreenIdReferences(uiData, validScreenIds, document);
      diagnostics.push(...screenIdErrors);
      
    } catch (error) {
      // If JSON parsing fails, we can't validate cross-references
      console.warn('Failed to parse UI document for validation:', error);
    }
    
    return { diagnostics, validScreenIds };
  }
  
  /**
   * Extracts all valid screen IDs from the screens section
   */
  private static extractScreenIds(uiData: any): string[] {
    const screenIds: string[] = [];
    
    if (Array.isArray(uiData)) {
      for (const item of uiData) {
        if (item.screens && Array.isArray(item.screens)) {
          for (const screen of item.screens) {
            if (screen.id && typeof screen.id === 'string') {
              screenIds.push(screen.id);
            }
          }
        }
      }
    }
    
    return screenIds;
  }
  
  /**
   * Validates all screenId references against the valid screen IDs
   */
  private static validateScreenIdReferences(uiData: any, validScreenIds: string[], document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    if (Array.isArray(uiData)) {
      for (const item of uiData) {
        // Validate tabs
        if (item.tabs && Array.isArray(item.tabs)) {
          for (const tab of item.tabs) {
            if (tab.screenId && typeof tab.screenId === 'string') {
              if (!validScreenIds.includes(tab.screenId)) {
                const diagnostic = this.createScreenIdDiagnostic(
                  tab.screenId,
                  'tab',
                  validScreenIds,
                  document
                );
                if (diagnostic) {
                  diagnostics.push(diagnostic);
                }
              }
            }
          }
        }
        
        // Validate search filters
        if (item.search && item.search.filters && Array.isArray(item.search.filters)) {
          for (const filter of item.search.filters) {
            if (filter.screenId && typeof filter.screenId === 'string') {
              if (!validScreenIds.includes(filter.screenId)) {
                const diagnostic = this.createScreenIdDiagnostic(
                  filter.screenId,
                  'search filter',
                  validScreenIds,
                  document
                );
                if (diagnostic) {
                  diagnostics.push(diagnostic);
                }
              }
            }
          }
        }
        
        // Validate notifications
        if (item.notifications && Array.isArray(item.notifications)) {
          for (const notification of item.notifications) {
            if (notification.buttons && Array.isArray(notification.buttons)) {
              for (const button of notification.buttons) {
                if (button.screenId && typeof button.screenId === 'string') {
                  if (!validScreenIds.includes(button.screenId)) {
                    const diagnostic = this.createScreenIdDiagnostic(
                      button.screenId,
                      'notification button',
                      validScreenIds,
                      document
                    );
                    if (diagnostic) {
                      diagnostics.push(diagnostic);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return diagnostics;
  }
  
  /**
   * Creates a diagnostic for an invalid screenId reference
   */
  private static createScreenIdDiagnostic(
    invalidScreenId: string,
    context: string,
    validScreenIds: string[],
    document: TextDocument
  ): Diagnostic | null {
    try {
      // Find the position of the invalid screenId in the document
      const content = document.getText();
      const searchPattern = new RegExp(`"screenId"\\s*:\\s*"${this.escapeRegExp(invalidScreenId)}"`, 'g');
      const matches = content.matchAll(searchPattern);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const startPos = document.positionAt(match.index);
          const endPos = document.positionAt(match.index + match[0].length);
          
          const suggestions = validScreenIds.length > 0 
            ? `\n\nValid screen IDs: ${validScreenIds.join(', ')}`
            : '\n\nNo screens defined in the UI configuration.';
          
          return {
            severity: DiagnosticSeverity.Error,
            range: { start: startPos, end: endPos },
            message: `Invalid screenId "${invalidScreenId}" in ${context}. This screen ID does not exist in the screens section.${suggestions}`,
            source: 'Control4 UI Validator'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to create diagnostic for invalid screenId:', error);
    }
    
    return null;
  }
  
  /**
   * Escapes special regex characters in a string
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Provides completion suggestions for screenId fields
   */
  public static getScreenIdSuggestions(validScreenIds: string[]): string[] {
    return validScreenIds;
  }
} 