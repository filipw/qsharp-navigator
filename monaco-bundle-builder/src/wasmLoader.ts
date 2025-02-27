// WASM Loader for Q# Language Services

import {
  loadWasmModule,
  log,
  getLanguageServiceWorker,
  getCompilerWorker,
} from "qsharp-lang";

// Set the log level
log.setLogLevel("info");

// Log initialization
console.log("[INFO] Q# WASM loader initializing");

// When the DOM is loaded, notify that we're ready
window.addEventListener('DOMContentLoaded', () => {
  console.log("[INFO] WASM loader script ready");
});

// Function to initialize the Q# WASM module - will be called by the main script
window.initializeQSharpWasm = async function(wasmUrl, lsWorkerPath, compilerWorkerPath) {
  console.log("[INFO] initializeQSharpWasm called");
  console.log("[INFO] WASM URL: " + wasmUrl);
  console.log("[INFO] LS Worker URL: " + lsWorkerPath);
  console.log("[INFO] Compiler Worker URL: " + compilerWorkerPath);
  
  try {
    // Load the WASM module
    await loadWasmModule(wasmUrl);
    console.log("WASM module loaded successfully");
    
    // Create the language service and compiler workers
    const languageService = getLanguageServiceWorker(lsWorkerPath);
    const compiler = getCompilerWorker(compilerWorkerPath);
    
    // Log available methods for debugging
    console.log("Language service methods:", Object.keys(languageService).join(", "));
    console.log("Compiler methods:", Object.keys(compiler).join(", "));
    
    // Expose the workers globally
    window.qsharpLanguageService = languageService;
    window.qsharpCompiler = compiler;
    
    console.log("Language service and compiler workers initialized.");
    
    return true;
  } catch (error) {
    console.error("Failed to load WASM module:", error);
    throw error;
  }
};

// Make TypeScript happy
declare global {
  interface Window {
    qsharpLanguageService: any;
    qsharpCompiler: any;
    initializeQSharpWasm: (wasmUrl: string, lsWorkerUrl: string, compilerWorkerUrl: string) => Promise<boolean>;
  }
}