//
//  strathweb_qsharp_bridge_sampleApp.swift
//  qsharp.navigator
//
//  Created by Filip W on 17.07.23.
//

import SwiftUI
import WebKit
import GCDWebServer

@main
struct strathweb_qsharp_bridge_sampleApp: App {
    static let webServer = GCDWebServer()
    
    init() {
        startLocalHTTPServer()
        configureWasmService()
    }
    
    var body: some Scene {
        WindowGroup {
            MainView()
        }
    }
    
    func startLocalHTTPServer() {
        guard let resourcePath = Bundle.main.resourcePath else {
            print("ERROR: Resource path not found")
            return
        }
        print("App Resource Path: \(resourcePath)")
        
        // Set up the local HTTP server
        strathweb_qsharp_bridge_sampleApp.webServer.addGETHandler(
            forBasePath: "/",
            directoryPath: resourcePath,
            indexFilename: "monaco.html",
            cacheAge: 0, // Disable caching during development
            allowRangeRequests: true
        )

        do {
            try strathweb_qsharp_bridge_sampleApp.webServer.start(options: [
                GCDWebServerOption_Port: 8080,
                GCDWebServerOption_BindToLocalhost: true
            ])
            print("Local HTTP Server started at: \(String(describing: strathweb_qsharp_bridge_sampleApp.webServer.serverURL))")
        } catch {
            print("ERROR: Could not start web server: \(error)")
        }
    }
    
    func configureWasmService() {
        guard let resourceURL = Bundle.main.resourceURL,
              let serverURL = strathweb_qsharp_bridge_sampleApp.webServer.serverURL else {
            print("ERROR: Missing resource or server URL")
            return
        }
        
        let wasmURL = serverURL.appendingPathComponent("qsc_wasm_bg.wasm")
        let lsWorkerURL = serverURL.appendingPathComponent("language-service-worker.js")
        let compilerWorkerURL = serverURL.appendingPathComponent("compiler-worker.js")
        
        QSharpWasmService.shared.configure(
            wasmURL: wasmURL,
            languageServiceWorkerURL: lsWorkerURL,
            compilerWorkerURL: compilerWorkerURL,
            resourcesPath: resourceURL
        )
        
        print("QSharpWasmService configured successfully")
    }
}
