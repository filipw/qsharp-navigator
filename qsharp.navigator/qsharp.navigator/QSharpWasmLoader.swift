import Foundation
import WebKit

// This class manages loading and interacting with the Q# WebAssembly module
class QSharpWasmLoader {
    // Singleton instance
    static let shared = QSharpWasmLoader()
    
    private var wasmURL: URL?
    private var isLoaded = false
    
    private init() {
        // Private initializer for singleton
    }
    
    // Set the URL where the Q# WASM file is located
    func setWasmURL(_ url: URL) {
        self.wasmURL = url
    }
    
    // Load the WASM module into a WebView
    func loadWasmModule(into webView: WKWebView, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let wasmURL = wasmURL else {
            completion(.failure(NSError(domain: "QSharpWasmLoader", code: 1, userInfo: [NSLocalizedDescriptionKey: "WASM URL not set"])))
            return
        }
        
        // First check if the WASM file exists
        let fileManager = FileManager.default
        if !fileManager.fileExists(atPath: wasmURL.path) {
            completion(.failure(NSError(domain: "QSharpWasmLoader", code: 2, userInfo: [NSLocalizedDescriptionKey: "WASM file not found at \(wasmURL.path)"])))
            return
        }
        
        // Create a bundle to host the WASM file
        if let bundlePath = Bundle.main.resourceURL {
            // Create a JavaScript snippet to load the WASM module
            let jsCode = """
            (async function() {
                try {
                    const wasmModule = await WebAssembly.compileStreaming(fetch('\(wasmURL.absoluteString)'));
                    const instance = await WebAssembly.instantiate(wasmModule);
                    window.qSharpWasm = instance;
                    window.webkit.messageHandlers.wasmLoaded.postMessage({
                        success: true,
                        message: "WASM module loaded successfully"
                    });
                } catch (error) {
                    console.error("Failed to load WASM module:", error);
                    window.webkit.messageHandlers.wasmLoaded.postMessage({
                        success: false, 
                        message: error.toString()
                    });
                }
            })();
            """
            
            // Execute the JavaScript to load the WASM module
            webView.evaluateJavaScript(jsCode) { _, error in
                if let error = error {
                    completion(.failure(error))
                }
                // The actual result will come through the message handler
            }
        } else {
            completion(.failure(NSError(domain: "QSharpWasmLoader", code: 3, userInfo: [NSLocalizedDescriptionKey: "Could not get bundle path"])))
        }
    }
    
    // Helper method to create a message handler for WASM loading
    func createWasmLoadedHandler(completion: @escaping (Result<Void, Error>) -> Void) -> WKScriptMessageHandler {
        return WasmLoadedHandler(completion: completion)
    }
    
    // Message handler for WASM loading
    class WasmLoadedHandler: NSObject, WKScriptMessageHandler {
        let completion: (Result<Void, Error>) -> Void
        
        init(completion: @escaping (Result<Void, Error>) -> Void) {
            self.completion = completion
            super.init()
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let success = body["success"] as? Bool,
                  let messageText = body["message"] as? String else {
                completion(.failure(NSError(domain: "QSharpWasmLoader", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid message format"])))
                return
            }
            
            if success {
                QSharpWasmLoader.shared.isLoaded = true
                completion(.success(()))
            } else {
                completion(.failure(NSError(domain: "QSharpWasmLoader", code: 5, userInfo: [NSLocalizedDescriptionKey: messageText])))
            }
        }
    }
    
    // Check if the WASM module is loaded
    func isWasmModuleLoaded() -> Bool {
        return isLoaded
    }
    
    // Initialize the Q# language service in a WebView
    func initQSharpLanguageService(in webView: WKWebView) {
        guard isLoaded else {
            print("WASM module not loaded yet")
            return
        }
        
        let jsCode = """
        // Initialize language service with the loaded WASM module
        if (window.qSharpWasm && window.QSharpEditor) {
            try {
                QSharpEditor.initLanguageServiceWithWasm(window.qSharpWasm);
            } catch (error) {
                console.error("Failed to initialize language service:", error);
                window.webkit.messageHandlers.logMessage.postMessage({
                    level: "error",
                    message: "Failed to initialize language service: " + error.toString()
                });
            }
        } else {
            console.error("QSharpWasm or QSharpEditor not available");
        }
        """
        
        webView.evaluateJavaScript(jsCode) { _, error in
            if let error = error {
                print("Error initializing Q# language service: \(error.localizedDescription)")
            }
        }
    }
}
