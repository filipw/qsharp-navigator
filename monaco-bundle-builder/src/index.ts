import "./wasmLoader";

// Define fixed paths instead of passing them as parameters
const WASM_URL = './qsharp/qsc_wasm_bg.wasm';
const LS_WORKER_PATH = './language-service-worker.js';
const COMPILER_WORKER_PATH = './compiler-worker.js';

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

// Logger helper
function logMessage(level, message) {
  console.log("[" + level.toUpperCase() + "] " + message);
  try {
    window.webkit.messageHandlers.logMessage.postMessage({
      level: level,
      message: message
    });
  } catch (e) {}
}

// Position conversion helpers
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

// QSharp Language Service
const QSharpLanguageService = {
  editor: null,
  monaco: null,
  isInitialized: false,
  
  initialize: async function() {
    try {
      logMessage("info", "Initializing Q# language service");
      
      // Load Monaco if not already loaded
      if (!window.monaco) {
        await this.loadMonaco();
      }
      
      this.setupQSharpLanguage();
      
      // Set up paths for WASM service
      window.qscBasePath = WASM_URL.substring(0, WASM_URL.lastIndexOf('/') + 1);
      window.qscWasmPath = WASM_URL;
      window.languageServiceWorkerPath = LS_WORKER_PATH;
      window.compilerWorkerPath = COMPILER_WORKER_PATH;
      
      // Initialize WASM service
      try {
        await window.initializeQSharpWasm(WASM_URL, LS_WORKER_PATH, COMPILER_WORKER_PATH);
        
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
      try {
        window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
          success: true,
          message: "Language service initialized successfully"
        });
      } catch (e) {
        logMessage("error", "Failed to notify Swift of successful initialization");

        // Set initial sample code
        const sampleCode = 'namespace Quantum.Sample {\n open Microsoft.Quantum.Intrinsic;\n open Microsoft.Quantum.Canon;\n\n operation HelloQ() : Unit {\n Message("Hello quantum world!");\n }\n}';
        this.updateEditorContent(sampleCode);
      }
      
      return true;
    } catch (error) {
      logMessage("error", "Failed to initialize Q# language service: " + error.toString());
      
      // Notify Swift of error
      try {
        window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
          success: false,
          message: error.toString()
        });
      } catch (e) {
        logMessage("error", "Failed to notify Swift of initialization error");
      }
      
      throw error;
    }
  },
  
  loadMonaco: function() {
    return new Promise((resolve, reject) => {
      try {
        require.config({
          paths: { 'vs': 'vs' }
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
  
  registerMonacoProviders: function() {
    logMessage("info", "Registering Monaco providers for Q#");
    
    // Register completion provider
    monaco.languages.registerCompletionItemProvider("qsharp", {
      triggerCharacters: [".", "@"],
      
      provideCompletionItems: async (model, position) => {
        // Skip if not our language
        if (model.getLanguageId() !== 'qsharp') {
          return { suggestions: [] };
        }
        
        try {
          if (!window.qsharpLanguageService) {
            return { suggestions: [] };
          }
          
          const completions = await window.qsharpLanguageService.getCompletions(
            model.uri.toString(),
            monacoPositionToLsPosition(position)
          );
          
          if (completions && completions.items) {
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
    
    // Set up content change handler
    this.editor.onDidChangeModelContent(() => {
      try {
        const value = this.editor.getValue();
        
        // Send content to Swift
        try {
          window.webkit.messageHandlers.codeChanged.postMessage(value);
        } catch (e) {
          // Ignore - we're in test mode
        }
        
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
        // Ignore - we're in test mode
      }
    });
    
    // Notify Swift that the editor is ready to receive content
    try {
      window.webkit.messageHandlers.editorReady.postMessage({});
    } catch (error) {
      // Ignore - we're in test mode
    }
  },
  
  // Update editor content with new code
  updateEditorContent: function(text) {
    if (!this.editor) {
      logMessage("error", "Editor not initialized when trying to update content");
      return false;
    }
    
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
  },
  
  // Set editor options
  setEditorOptions: function(options) {
    if (!this.editor) {
      logMessage("error", "Editor not initialized when trying to update options");
      return false;
    }
    
    this.editor.updateOptions(options);
    return true;
  },
  
  // Get current editor content
  getEditorContent: function() {
    if (!this.editor) {
      return null;
    }
    return this.editor.getValue();
  }
};

// Export the service globally
window.QSharpLanguageService = QSharpLanguageService;

// Export global functions for Swift to call
window.updateEditorContent = function(text) {
  if (window.QSharpLanguageService) {
    return window.QSharpLanguageService.updateEditorContent(text);
  }
  return false;
};

window.setEditorOptions = function(options) {
  if (window.QSharpLanguageService) {
    return window.QSharpLanguageService.setEditorOptions(options);
  }
  return false;
};

window.getEditorContent = function() {
  if (window.QSharpLanguageService) {
    return window.QSharpLanguageService.getEditorContent();
  }
  return null;
};

// Initialize automatically on page load - no need for explicit function call
document.addEventListener('DOMContentLoaded', function() {
  logMessage("info", "Page loaded. Initializing editor...");
  QSharpLanguageService.initialize().catch(function(error) {
    logMessage("error", "Error during initialization: " + error.toString());
  });
});