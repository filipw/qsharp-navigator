import SwiftUI
import WebKit

struct EditorPosition {
    var line: Int = 1
    var column: Int = 1
}

struct MonacoEditor: View {
    @Binding var text: String
    @Binding var position: EditorPosition
    var layout: MonacoLayout
    
    // Optional callback for editor events
    var onCodeExecuted: ((String) -> Void)? = nil
    
    var body: some View {
        MonacoEditorRepresentable(
            text: $text,
            position: $position,
            showMinimap: layout.showMinimap,
            wrapText: layout.wrapText
        )
        .cornerRadius(4)
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
    
    struct MonacoLayout {
        var showMinimap: Bool
        var wrapText: Bool
        
        init(showMinimap: Bool = true, wrapText: Bool = true) {
            self.showMinimap = showMinimap
            self.wrapText = wrapText
        }
    }
}

extension MonacoEditor {
    typealias LayoutConfiguration = MonacoLayout
}

struct MonacoEditorRepresentable: UIViewRepresentable {
    @Binding var text: String
    @Binding var position: EditorPosition
    var showMinimap: Bool
    var wrapText: Bool
    
    func makeUIView(context: Context) -> WKWebView {
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true
        
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences = preferences
        configuration.userContentController.add(context.coordinator, name: "codeChanged")
        configuration.userContentController.add(context.coordinator, name: "cursorPositionChanged")
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.bounces = true
        webView.scrollView.showsHorizontalScrollIndicator = false
        webView.scrollView.showsVerticalScrollIndicator = true
        
        // Prevent zoom
        webView.scrollView.bouncesZoom = false
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.minimumZoomScale = 1.0
        
        // Load Monaco Editor HTML
        webView.loadHTMLString(getMonacoEditorHTML(), baseURL: nil)
        
        return webView
    }
    
    // Update the Monaco editor when SwiftUI state changes
    func updateUIView(_ webView: WKWebView, context: Context) {
        // Only update the editor content if it differs from what we last received from JS
        // to prevent update loops
        if context.coordinator.lastReceivedCode != text {
            let escapedCode = escapeCodeForJS(text)
            webView.evaluateJavaScript("updateEditorContent(\"\(escapedCode)\");", completionHandler: nil)
        }
        
        // Update editor settings based on the layout options
        webView.evaluateJavaScript("setEditorOptions({ minimap: { enabled: \(showMinimap) }, wordWrap: '\(wrapText ? "on" : "off")' });", completionHandler: nil)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    private func escapeCodeForJS(_ code: String) -> String {
        return code.replacingOccurrences(of: "\\", with: "\\\\")
                   .replacingOccurrences(of: "\"", with: "\\\"")
                   .replacingOccurrences(of: "\n", with: "\\n")
                   .replacingOccurrences(of: "\r", with: "\\r")
                   .replacingOccurrences(of: "\t", with: "\\t")
    }
    
    private func getMonacoEditorHTML() -> String {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                html, body, #container {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    -webkit-text-size-adjust: 100%;
                }
                .monaco-editor {
                    font-family: "SF Mono", Monaco, Menlo, monospace;
                }
                textarea {
                    /* Prevent iOS zoom */
                    font-size: 16px !important;
                }
            </style>
        </head>
        <body>
            <div id="container"></div>
            
            <script>
                // Simple code editor implementation that doesn't require CDN
                let editor = {
                    element: document.getElementById('container'),
                    content: '',
                    selectionStart: 0,
                    selectionEnd: 0,
                    listeners: {},
                    
                    // Initialize the editor
                    init: function() {
                        // Create textarea for editing
                        this.textarea = document.createElement('textarea');
                        this.textarea.style.width = '100%';
                        this.textarea.style.height = '100%';
                        this.textarea.style.boxSizing = 'border-box';
                        this.textarea.style.padding = '10px';
                        this.textarea.style.border = 'none';
                        this.textarea.style.outline = 'none';
                        this.textarea.style.fontFamily = 'SF Mono, Monaco, Menlo, monospace';
                        this.textarea.style.fontSize = '16px'; // Minimum font size to prevent iOS zoom
                        this.textarea.style.resize = 'none';
                        this.textarea.style.backgroundColor = '#1e1e1e';
                        this.textarea.style.color = '#d4d4d4';
                        this.textarea.spellcheck = false;
                        this.textarea.autocorrect = 'off';
                        this.textarea.autocapitalize = 'off';
                        this.textarea.autocomplete = 'off';
                        
                        // Add change listener
                        this.textarea.addEventListener('input', () => {
                            this.content = this.textarea.value;
                            this._triggerEvent('change');
                        });
                        
                        // Add cursor position listener
                        this.textarea.addEventListener('click', this._updatePosition.bind(this));
                        this.textarea.addEventListener('keyup', this._updatePosition.bind(this));
                        
                        // Prevent zoom on double-tap
                        document.addEventListener('gesturestart', function(e) {
                            e.preventDefault();
                        });
                        
                        // Add to DOM
                        this.element.appendChild(this.textarea);
                    },
                    
                    // Set content
                    setValue: function(value) {
                        if (this.content !== value) {
                            this.content = value;
                            this.textarea.value = value;
                        }
                    },
                    
                    // Get content
                    getValue: function() {
                        return this.content;
                    },
                    
                    // Set cursor position
                    setPosition: function(position) {
                        if (position && this.textarea) {
                            try {
                                this.textarea.selectionStart = this._getPositionOffset(position);
                                this.textarea.selectionEnd = this._getPositionOffset(position);
                                this.textarea.focus();
                            } catch (e) {
                                console.error('Error setting position:', e);
                            }
                        }
                    },
                    
                    // Get current position offset
                    _getPositionOffset: function(position) {
                        const lines = this.content.split('\\n');
                        let offset = 0;
                        
                        // Count characters in previous lines
                        for (let i = 0; i < position.lineNumber - 1 && i < lines.length; i++) {
                            offset += lines[i].length + 1; // +1 for newline
                        }
                        
                        // Add column position
                        offset += Math.min(position.column - 1, lines[position.lineNumber - 1]?.length || 0);
                        
                        return offset;
                    },
                    
                    // Update cursor position
                    _updatePosition: function() {
                        if (!this.textarea) return;
                        
                        const value = this.textarea.value;
                        const cursorPos = this.textarea.selectionStart;
                        
                        // Calculate line and column
                        let lineNumber = 1;
                        let column = 1;
                        
                        for (let i = 0; i < cursorPos; i++) {
                            if (value[i] === '\\n') {
                                lineNumber++;
                                column = 1;
                            } else {
                                column++;
                            }
                        }
                        
                        // Trigger position change event
                        this._triggerEvent('positionChange', {
                            position: { lineNumber, column }
                        });
                    },
                    
                    // Add event listener
                    onDidChangeModelContent: function(callback) {
                        this._addEventListener('change', callback);
                    },
                    
                    // Add position change listener
                    onDidChangeCursorPosition: function(callback) {
                        this._addEventListener('positionChange', callback);
                    },
                    
                    // Update editor options
                    updateOptions: function(options) {
                        if (!this.textarea) return;
                        
                        // Handle word wrap
                        if (options && options.wordWrap !== undefined) {
                            this.textarea.style.whiteSpace = options.wordWrap === 'on' ? 'pre-wrap' : 'pre';
                        }
                    },
                    
                    // Add event listener
                    _addEventListener: function(event, callback) {
                        if (!this.listeners[event]) {
                            this.listeners[event] = [];
                        }
                        this.listeners[event].push(callback);
                    },
                    
                    // Trigger event
                    _triggerEvent: function(event, data) {
                        if (this.listeners[event]) {
                            this.listeners[event].forEach(callback => callback(data));
                        }
                    }
                };
                
                // Initialize editor
                document.addEventListener('DOMContentLoaded', function() {
                    editor.init();
                });
                
                // If DOM is already loaded, initialize immediately
                if (document.readyState === 'interactive' || document.readyState === 'complete') {
                    editor.init();
                }
                
                // Function to update editor content from Swift
                function updateEditorContent(newContent) {
                    editor.setValue(newContent);
                }
                
                // Function to update editor options
                function setEditorOptions(options) {
                    editor.updateOptions(options);
                }
                
                // Listen for content changes
                editor.onDidChangeModelContent(function() {
                    // Send code back to Swift
                    window.webkit.messageHandlers.codeChanged.postMessage(editor.getValue());
                });
                
                // Listen for position changes
                editor.onDidChangeCursorPosition(function(e) {
                    window.webkit.messageHandlers.cursorPositionChanged.postMessage({
                        lineNumber: e.position.lineNumber,
                        column: e.position.column
                    });
                });
            </script>
        </body>
        </html>
        """
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: MonacoEditorRepresentable
        var lastReceivedCode: String = ""
        
        init(_ parent: MonacoEditorRepresentable) {
            self.parent = parent
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            switch message.name {
            case "codeChanged":
                if let codeStr = message.body as? String {
                    lastReceivedCode = codeStr
                    DispatchQueue.main.async {
                        self.parent.text = codeStr
                    }
                }
                
            case "cursorPositionChanged":
                if let positionData = message.body as? [String: Int],
                   let line = positionData["lineNumber"],
                   let column = positionData["column"] {
                    DispatchQueue.main.async {
                        self.parent.position = EditorPosition(line: line, column: column)
                    }
                }
                
            default:
                break
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            let escapedCode = parent.escapeCodeForJS(parent.text)
            webView.evaluateJavaScript("updateEditorContent(\"\(escapedCode)\");", completionHandler: nil)
        }
    }
}
