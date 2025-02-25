import Foundation
import SwiftUI

class CodeExampleModel: ObservableObject {
    @Published var code: String
    @Published var title: String
    
    @Published var shots = 1.0
    @Published var isEditing = false
    @Published var showResults = false
    @Published var editorPosition = EditorPosition()
    @Published var showMinimap = true
    @Published var wrapText = true
    @Published var isPlaying = false
    
    @Published var executionStates: [ExecutionState] = []
    
    init(code: String, title: String) {
        self.code = code
        self.title = title
    }
    
    func runShots() {
        DispatchQueue.main.async {
            self.showResults = false
        }
        
        let results = try! runQsShots(source: code, shots: UInt32(shots))
        print(results.count)
        DispatchQueue.main.async {
            self.executionStates = results
            self.showResults = true
        }
    }
}

extension ExecutionState: Identifiable {
    public var id: String {
        return UUID().uuidString
    }
}
