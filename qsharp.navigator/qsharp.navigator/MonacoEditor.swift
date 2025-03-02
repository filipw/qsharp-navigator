import SwiftUI
import WebKit

struct EditorPosition {
    var line: Int = 1
    var column: Int = 1
}

struct QSharpMonacoEditor: View {
    @Binding var text: String
    @Binding var position: EditorPosition
    var layout: MonacoLayout
    
    var onCodeExecuted: ((String) -> Void)? = nil
    
    var body: some View {
        QSharpMonacoRepresentable(
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
        
        init(showMinimap: Bool = false, wrapText: Bool = true) {
            self.showMinimap = showMinimap
            self.wrapText = wrapText
        }
    }
}

extension QSharpMonacoEditor {
    typealias LayoutConfiguration = MonacoLayout
}

struct QSharpMonacoRepresentable: UIViewRepresentable {
    @Binding var text: String
    @Binding var position: EditorPosition
    var showMinimap: Bool
    var wrapText: Bool

    func makeUIView(context: Context) -> WKWebView {
        print("🔍 makeUIView called with initial text: \(text.prefix(20))... (length: \(text.count))")
        
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true

        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences = preferences

        // Add message handlers
        configuration.userContentController.add(context.coordinator, name: "codeChanged")
        configuration.userContentController.add(context.coordinator, name: "cursorPositionChanged")
        configuration.userContentController.add(context.coordinator, name: "logMessage")
        configuration.userContentController.add(context.coordinator, name: "wasmServiceInitialized")
        configuration.userContentController.add(context.coordinator, name: "jsReady")
        configuration.userContentController.add(context.coordinator, name: "editorReady")
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.isInspectable = true
        
        context.coordinator.initialText = text
        
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.bounces = true
        webView.scrollView.showsHorizontalScrollIndicator = false
        webView.scrollView.showsVerticalScrollIndicator = true
        webView.scrollView.bouncesZoom = false
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.minimumZoomScale = 1.0

        if let serverURL = strathweb_qsharp_bridge_sampleApp.webServer.serverURL {
            let url = serverURL.appendingPathComponent("monaco.html")
            print("🔍 Loading Monaco editor from: \(url)")
            webView.load(URLRequest(url: url))
        } else {
            print("❌ ERROR: Local HTTP server URL not available")
        }
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        print("🔄 updateUIView called with text: \(text.prefix(20))... (length: \(text.count))")
        
        // Only update if the text changed from outside the editor
        // and it's not a change we're receiving back from the editor
        if context.coordinator.lastReceivedCode != text {
            if context.coordinator.editorReady {
                print("🔄 Sending text to editor (editor is ready)")
                let escapedCode = escapeCodeForJS(text)
                webView.evaluateJavaScript("updateEditorContent(\"\(escapedCode)\");") { result, error in
                    if let error = error {
                        print("❌ Error updating editor content: \(error)")
                    } else {
                        print("✅ Editor content updated successfully")
                    }
                }
            } else {
                print("⏳ Editor not ready yet, will update when ready")
            }
        }
        
        // Always update editor options when they change
        webView.evaluateJavaScript("setEditorOptions({ minimap: { enabled: \(showMinimap) }, wordWrap: '\(wrapText ? "on" : "off")' });") { result, error in
            if let error = error {
                print("❌ Error updating editor options: \(error)")
            }
        }
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

    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: QSharpMonacoRepresentable
        var lastReceivedCode: String = ""
        var initialText: String = ""
        var jsEnvironmentReady: Bool = false
        var editorReady: Bool = false
        
        init(_ parent: QSharpMonacoRepresentable) {
            self.parent = parent
            super.init()
        }
        
        // handle messages from JavaScript
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            switch message.name {
            case "codeChanged":
                if let codeStr = message.body as? String {
                    print("📥 Received code from editor, length: \(codeStr.count)")
                    self.lastReceivedCode = codeStr
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
                
            case "logMessage":
                if let logData = message.body as? [String: String],
                   let level = logData["level"],
                   let logMessage = logData["message"] {
                    print("📝 [\(level.uppercased())] \(logMessage)")
                }
                
            case "wasmServiceInitialized":
                if let resultData = message.body as? [String: Any],
                   let success = resultData["success"] as? Bool,
                   let messageText = resultData["message"] as? String {
                    print("🧩 [WASM SERVICE] Initialization \(success ? "successful" : "failed"): \(messageText)")
                }
                
            case "editorReady":
                print("✅ Editor is now ready")
                self.editorReady = true
                
                if !self.initialText.isEmpty {
                    print("📤 Setting initial editor content, length: \(self.initialText.count)")
                    let escapedCode = self.parent.escapeCodeForJS(self.initialText)
                    message.webView?.evaluateJavaScript("updateEditorContent(\"\(escapedCode)\");") { _, error in
                        if let error = error {
                            print("❌ Failed to set initial editor content: \(error)")
                        } else {
                            print("✅ Initial editor content set successfully")
                        }
                    }
                }
                
            case "jsReady":
                print("🌐 JS environment reported ready")
                jsEnvironmentReady = true
                
            default:
                print("⚠️ Received unknown message: \(message.name)")
                break
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("🌐 WebView navigation finished")
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("❌ WebView navigation failed: \(error)")
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            print("❌ WebView provisional navigation failed: \(error)")
        }
    }
}
