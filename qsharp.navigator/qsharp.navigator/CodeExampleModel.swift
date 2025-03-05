import Foundation
import Qsharp_Bridge
import SwiftUI

class CodeExampleModel: ObservableObject {
    @Published var code: String
    @Published var title: String
    
    @Published var shots = 1.0
    @Published var isEditing = false
    @Published var showResults = false
    @Published var showResultsSheet = false
    @Published var editorPosition = EditorPosition()
    @Published var showMinimap = false
    @Published var wrapText = true
    @Published var isPlaying = false
    
    @Published var executionStates: [ExecutionState] = []
    @Published var diagnostics: [EditorDiagnostic] = []
    @Published var showDiagnostics = true
    @Published var showDiagnosticsSheet = false
    
    init(code: String, title: String) {
        self.code = code
        self.title = title
    }
    
    func runShots() {
        DispatchQueue.main.async {
            self.isPlaying = true
            self.showResults = false
        }
        
        let options = ExecutionOptions.fromShots(shots: UInt32(shots))
        let results = try! runQsWithOptions(source: code, options: options)
        print("Results count: \(results.count)")
        
        DispatchQueue.main.async {
            self.executionStates = results
            self.showResults = true
            self.showResultsSheet = true
            self.isPlaying = false
        }
    }
    
    var hasResults: Bool {
        return !executionStates.isEmpty && showResults
    }
    
    var hasDiagnostics: Bool {
        return !diagnostics.isEmpty
    }
    
    var hasErrors: Bool {
        return diagnostics.contains { $0.severity == .error }
    }
    
    var hasWarnings: Bool {
        return diagnostics.contains { $0.severity == .warning }
    }
}

extension ExecutionState: Identifiable {
    public var id: String {
        return UUID().uuidString
    }
}
