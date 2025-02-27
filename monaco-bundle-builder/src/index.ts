import "./wasmLoader";

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global error caught:", message, source, lineno, colno, error);
    try {
      window.webkit.messageHandlers.logMessage.postMessage({
        level: "error",
        message: "Global error: " + message + " at " + source + ":" + lineno + ":" + colno
      });
    } catch (e) {}
    return false;
  };
  
  function logMessage(level, message) {
    console.log("[" + level.toUpperCase() + "] " + message);
    try {
      window.webkit.messageHandlers.logMessage.postMessage({
        level: level,
        message: message
      });
    } catch (e) {}
  }
  
  // utility functions for conversion between Monaco and LS formats
  function monacoPositionToLsPosition(position) {
    return { line: position.lineNumber - 1, character: position.column - 1 };
  }
  
  function lsRangeToMonacoRange(range) {
    if (!range) return null;
    return new monaco.Range(
      range.start.line + 1,
      range.start.character + 1,
      range.end.line + 1,
      range.end.character + 1
    );
  }
  
  function monacoRangetoLsRange(range) {
    return {
      start: {
        line: range.startLineNumber - 1,
        character: range.startColumn - 1,
      },
      end: { line: range.endLineNumber - 1, character: range.endColumn - 1 },
    };
  }
  
  export const QSharpLanguageService = {
    editor: null,
    monaco: null,
    isInitialized: false,
    
    initialize: async function(wasmPath, lsWorkerPath, compilerWorkerPath) {
      try {
        logMessage("info", "Initializing Q# language service");
        
        if (!window.monaco) {
          await this.loadMonaco();
        }
        
        this.setupQSharpLanguage();
        
        // Initialize WASM service
        try {
          await window.initializeQSharpWasm(wasmPath, lsWorkerPath, compilerWorkerPath);
          
          // Configure the language service with a default target profile
          if (window.qsharpLanguageService && window.qsharpLanguageService.updateConfiguration) {
            await window.qsharpLanguageService.updateConfiguration({
              targetProfile: "unrestricted",
              packageType: "exe",
              lints: [{ lint: "needlessOperation", level: "warn" }]
            });
            logMessage("info", "Language service configuration updated");
          }
        } catch (error) {
          logMessage("error", "Failed to initialize WASM: " + error.toString());
          // Continue anyway - we'll set up the editor UI
        }
        
        this.registerMonacoProviders();
        this.createEditor();
        
        this.isInitialized = true;
        logMessage("info", "Q# language service initialized successfully");
        
        // Notify Swift
        window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
          success: true,
          message: "Language service initialized successfully"
        });
        
        return true;
      } catch (error) {
        logMessage("error", "Failed to initialize Q# language service: " + error.toString());
        
        // Notify Swift of error
        window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
          success: false,
          message: error.toString()
        });
        
        throw error;
      }
    },
  
    createLanguageService() {
      return window.qsharpLanguageService;
    },
    
    // Register Monaco providers for the language service
    registerMonacoProviders: function() {
      logMessage("info", "Registering Monaco providers for Q#");
      
      // Register completion provider
      monaco.languages.registerCompletionItemProvider("qsharp", {
        triggerCharacters: [".", "@"],
        
        provideCompletionItems: async (model, position) => {
          logMessage("debug", `Completion requested at ${position.lineNumber}:${position.column}`);
          
          // Debug the model's language ID
          logMessage("debug", `Model language: ${model.getLanguageId()}`);
          
          // Skip if not our language
          if (model.getLanguageId() !== 'qsharp') {
            logMessage("debug", "Skipping completions for non-qsharp model");
            return { suggestions: [] };
          }
          
          try {
            if (!window.qsharpLanguageService) {
              logMessage("warn", "Language service not available for completions");
              return { suggestions: [] };
            }
            
            const completions = await window.qsharpLanguageService.getCompletions(
              model.uri.toString(),
              monacoPositionToLsPosition(position)
            );
            
            if (completions && completions.items) {
              logMessage("debug", `Received ${completions.items.length} completion items`);
              
              return {
                suggestions: completions.items.map((i) => {
                  let kind;
                  switch (i.kind) {
                    case "function": kind = monaco.languages.CompletionItemKind.Function; break;
                    case "interface": kind = monaco.languages.CompletionItemKind.Interface; break;
                    case "keyword": kind = monaco.languages.CompletionItemKind.Keyword; break;
                    case "variable": kind = monaco.languages.CompletionItemKind.Variable; break;
                    case "typeParameter": kind = monaco.languages.CompletionItemKind.TypeParameter; break;
                    case "module": kind = monaco.languages.CompletionItemKind.Module; break;
                    case "property": kind = monaco.languages.CompletionItemKind.Property; break;
                    case "field": kind = monaco.languages.CompletionItemKind.Field; break;
                    case "class": kind = monaco.languages.CompletionItemKind.Class; break;
                    default: kind = monaco.languages.CompletionItemKind.Text;
                  }
                  
                  return {
                    label: i.label,
                    kind: kind,
                    insertText: i.insertText || i.label,
                    sortText: i.sortText,
                    detail: i.detail,
                    documentation: i.documentation,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    additionalTextEdits: i.additionalTextEdits?.map((edit) => {
                      return {
                        range: lsRangeToMonacoRange(edit.range),
                        text: edit.newText
                      };
                    }),
                  };
                })
              };
            } else {
              logMessage("warn", "Received empty completion response");
              return { suggestions: [] };
            }
          } catch (error) {
            logMessage("error", `Error getting completions: ${error.message}`);
            return { suggestions: [] };
          }
        }
      });
      
      // Register hover provider
      monaco.languages.registerHoverProvider("qsharp", {
        provideHover: async (model, position) => {
          // Skip if not our language
          if (model.getLanguageId() !== 'qsharp') {
            return null;
          }
          
          try {
            if (!window.qsharpLanguageService) {
              return null;
            }
            
            const hover = await window.qsharpLanguageService.getHover(
              model.uri.toString(),
              monacoPositionToLsPosition(position)
            );
            
            if (hover && hover.contents) {
              return {
                contents: [{ value: hover.contents }],
                range: hover.span ? lsRangeToMonacoRange(hover.span) : undefined
              };
            }
            return null;
          } catch (error) {
            logMessage("error", `Error getting hover: ${error.message}`);
            return null;
          }
        }
      });
      
      logMessage("info", "Monaco providers registered for Q#");
    },
  
    loadMonaco: function() {
      return new Promise((resolve, reject) => {
        try {
          require.config({
            paths: { 'vs': 'http://localhost:8080/vs' }
          });
          
          require(['vs/editor/editor.main'], () => {
            logMessage("info", "Monaco editor modules loaded successfully");
            this.monaco = monaco;
            document.getElementById('loading').style.display = 'none';
            resolve();
          });
        } catch (error) {
          logMessage("error", "Error loading Monaco: " + error.toString());
          reject(error);
        }
      });
    },
  
    setupQSharpLanguage: function() {
      logMessage("info", "Registering Q# language with Monaco");
      
      // Register the language
      monaco.languages.register({ id: 'qsharp' });
      
      // Set up syntax highlighting
      monaco.languages.setMonarchTokensProvider('qsharp', {
        defaultToken: '',
        tokenPostfix: '.qs',
        keywords: [
          'namespace', 'open', 'operation', 'function', 'body', 'adjoint', 'controlled',
          'if', 'elif', 'else', 'repeat', 'until', 'for', 'in', 'return', 'fail',
          'within', 'apply', 'using', 'borrow', 'use', 'let', 'mutable', 'set',
          'new', 'not', 'and', 'or', 'true', 'false'
        ],
        typeKeywords: [
          'Unit', 'Int', 'BigInt', 'Double', 'Bool', 'String', 'Qubit', 'Result',
          'Range', 'Array', 'Pauli', 'Zero', 'One'
        ],
        symbols: /[=><!~?&|+\-*/^%]+/,
        brackets: [
          { open: '{', close: '}', token: 'delimiter.curly' },
          { open: '[', close: ']', token: 'delimiter.square' },
          { open: '(', close: ')', token: 'delimiter.parenthesis' },
          { open: '<', close: '>', token: 'delimiter.angle' }
        ],
        tokenizer: {
          root: [
            [/\s+/, ''],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string'],
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'type',
                '@default': 'identifier'
              }
            }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/\d+/, 'number'],
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/[+\-*/=<>!&|^%]+/, 'operator']
          ],
          comment: [
            [/[^/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            [/\*\//, 'comment', '@pop'],
            [/[/\*]/, 'comment']
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop']
          ]
        }
      });
      
      logMessage("info", "Q# language registered with Monaco");
    },
  
    createEditor: function() {
      logMessage("info", "Creating Monaco editor instance");
      
      // Create the model with the qsharp language
      const model = monaco.editor.createModel('', 'qsharp', monaco.Uri.parse('file:///main.qs'));
      
      // Create the editor with the model
      this.editor = monaco.editor.create(document.getElementById('container'), {
        model: model,
        language: 'qsharp',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: 'on',
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        tabSize: 4,
        insertSpaces: true
      });
      
      // Verify model is using qsharp language
      logMessage("info", `Editor created with language ID: ${this.editor.getModel().getLanguageId()}`);
      
      // Set up content change handler
      this.editor.onDidChangeModelContent(() => {
        try {
          const value = this.editor.getValue();
          logMessage("debug", "Editor content changed, length: " + value.length);
          
          // Send content to Swift
          window.webkit.messageHandlers.codeChanged.postMessage(value);
          
          // Update language service with the current content
          if (window.qsharpLanguageService) {
            const model = this.editor.getModel();
            window.qsharpLanguageService.updateDocument(
              model.uri.toString(),
              model.getVersionId(),
              value
            );
          }
        } catch (error) {
          logMessage("error", "Error in content change handler: " + error.toString());
        }
      });
      
      // Set up cursor position handler
      this.editor.onDidChangeCursorPosition((e) => {
        try {
          window.webkit.messageHandlers.cursorPositionChanged.postMessage({
            lineNumber: e.position.lineNumber,
            column: e.position.column
          });
        } catch (error) {
          logMessage("error", "Error in cursor position handler: " + error.toString());
        }
      });
      
      // Notify Swift that the editor is ready to receive content
      try {
        window.webkit.messageHandlers.editorReady.postMessage({});
        logMessage("info", "Sent editorReady message to Swift");
      } catch (error) {
        logMessage("error", "Error sending editorReady message: " + error.toString());
      }
    },
    
    // Update editor content with Swift code
    updateEditorContent: function(text) {
      logMessage("debug", "updateEditorContent called with text length: " + text.length);
      
      if (this.editor) {
        const currentValue = this.editor.getValue();
        if (currentValue !== text) {
          // Set the value in the editor
          this.editor.setValue(text);
          
          // Also update language service
          if (window.qsharpLanguageService) {
            const model = this.editor.getModel();
            window.qsharpLanguageService.updateDocument(
              model.uri.toString(),
              model.getVersionId(),
              text
            );
          }
          
          return true;
        }
        return false;
      } else {
        logMessage("error", "Editor not initialized when trying to update content");
        return false;
      }
    },
    
    // Set editor options
    setEditorOptions: function(options) {
      if (this.editor) {
        logMessage("debug", "Updating editor options: " + JSON.stringify(options));
        this.editor.updateOptions(options);
        return true;
      } else {
        logMessage("error", "Editor not initialized when trying to update options");
        return false;
      }
    },
    
    // Get current editor content
    getEditorContent: function() {
      if (this.editor) {
        return this.editor.getValue();
      }
      return null;
    }
  };

  window.QSharpLanguageService = QSharpLanguageService;
  
  // Global function to initialize the WASM service
  function initializeWasmService(wasmUrl, lsWorkerPath, compilerWorkerPath) {
    logMessage("info", "initializeWasmService called");
    logMessage("info", "WASM URL: " + wasmUrl);
    logMessage("info", "LS Worker URL: " + lsWorkerPath);
    logMessage("info", "Compiler Worker URL: " + compilerWorkerPath);
    
    window.qscBasePath = wasmUrl.substring(0, wasmUrl.lastIndexOf('/') + 1);
    window.qscWasmPath = wasmUrl;
    window.languageServiceWorkerPath = lsWorkerPath;
    window.compilerWorkerPath = compilerWorkerPath;
    
    // Start initialization but don't return the Promise
    if (window.QSharpLanguageService) {
      window.QSharpLanguageService.initialize(wasmUrl, lsWorkerPath, compilerWorkerPath)
        .catch(function(error) {
          logMessage("error", "Error during initialization: " + error.toString());
        });
    } else {
      logMessage("error", "QSharpLanguageService not found in WebView");
      try {
        window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
          success: false,
          message: "QSharpLanguageService not found in the WebView"
        });
      } catch (error) {
        logMessage("error", "Error sending initialization error message: " + error.toString());
      }
    }
  }
  
  // Global functions to expose methods
  function updateEditorContent(text) {
    logMessage("debug", "updateEditorContent global function called with text length: " + text.length);
    if (window.QSharpLanguageService) {
      return window.QSharpLanguageService.updateEditorContent(text);
    } else {
      logMessage("error", "QSharpLanguageService not available when updating content");
      return false;
    }
  }
  
  function setEditorOptions(options) {
    if (window.QSharpLanguageService) {
      return window.QSharpLanguageService.setEditorOptions(options);
    } else {
      logMessage("error", "QSharpLanguageService not available when updating options");
      return false;
    }
  }
  
  function getEditorContent() {
    if (window.QSharpLanguageService) {
      return window.QSharpLanguageService.getEditorContent();
    }
    return null;
  }
  
  // Expose global functions
  window.initializeWasmService = initializeWasmService;
  window.updateEditorContent = updateEditorContent;
  window.setEditorOptions = setEditorOptions;
  window.getEditorContent = getEditorContent;
  
  // Notify Swift when the page and scripts are fully loaded
  window.onload = function() {
    logMessage("info", "Page fully loaded. JS environment is ready.");
    try {
      window.webkit.messageHandlers.jsReady.postMessage("ready");
    } catch(e) {
      console.warn("jsReady handler not available:", e);
    }
  };