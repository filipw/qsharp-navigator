import Foundation
import WebKit

// This class manages loading and integrating the Q# WebAssembly language service
class QSharpWasmService {
    static let shared = QSharpWasmService()
    
    var wasmURL: URL?
    var languageServiceWorkerURL: URL?
    var compilerWorkerURL: URL?
    private var resourcesPath: URL?
    
    private init() {}
    
    func configure(wasmURL: URL, languageServiceWorkerURL: URL, compilerWorkerURL: URL, resourcesPath: URL) {
        self.wasmURL = wasmURL
        self.languageServiceWorkerURL = languageServiceWorkerURL
        self.compilerWorkerURL = compilerWorkerURL
        self.resourcesPath = resourcesPath
        print("[INFO] QSharpWasmService configured with:")
        print("[INFO] - WASM URL: \(wasmURL)")
        print("[INFO] - LS Worker: \(languageServiceWorkerURL)")
        print("[INFO] - Compiler Worker: \(compilerWorkerURL)")
    }
    
    func isConfigured() -> Bool {
        let configured = wasmURL != nil && languageServiceWorkerURL != nil && compilerWorkerURL != nil && resourcesPath != nil
        print("[INFO] QSharpWasmService isConfigured: \(configured)")
        return configured
    }
    
    func initializeLanguageService(in webView: WKWebView, completion: @escaping (Bool, String?) -> Void) {
        guard isConfigured() else {
            print("[ERROR] QSharpWasmService is not properly configured")
            completion(false, "QSharpWasmService is not properly configured")
            return
        }
        
        let initScript = """
        window.qscBasePath = '\(resourcesPath?.absoluteString ?? "")';
        window.qscWasmPath = '\(wasmURL!.absoluteString)';
        window.languageServiceWorkerPath = '\(languageServiceWorkerURL!.absoluteString)';
        window.compilerWorkerPath = '\(compilerWorkerURL!.absoluteString)';
        
        if (window.QSharpLanguageService) {
            initializeWasmService(
                window.qscWasmPath,
                window.languageServiceWorkerPath,
                window.compilerWorkerPath
            ).then(function(success) {
                window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
                    success: true,
                    message: "Q# language service initialized successfully"
                });
            }).catch(function(error) {
                window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
                    success: false,
                    message: error.toString()
                });
            });
        } else {
            window.webkit.messageHandlers.wasmServiceInitialized.postMessage({
                success: false,
                message: "QSharpLanguageService not found in the WebView"
            });
        }
        """
        
        webView.evaluateJavaScript(initScript) { _, error in
            if let error = error {
                print("[ERROR] Error initializing language service: \(error.localizedDescription)")
                completion(false, "Error initializing language service: \(error.localizedDescription)")
            }
            // Final result is handled by the message handler.
        }
    }
    
    // Create a message handler for initialization result
    func createInitializationHandler(completion: @escaping (Bool, String?) -> Void) -> WKScriptMessageHandler {
        return WasmServiceHandler(completion: completion)
    }
    
    // Helper class for handling WASM service initialization
    class WasmServiceHandler: NSObject, WKScriptMessageHandler {
        let completion: (Bool, String?) -> Void
        
        init(completion: @escaping (Bool, String?) -> Void) {
            self.completion = completion
            super.init()
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let success = body["success"] as? Bool,
                  let messageText = body["message"] as? String else {
                completion(false, "Invalid response format from language service initialization")
                return
            }
            
            completion(success, messageText)
        }
    }
}
