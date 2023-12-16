//
//  CodeExampleModel.swift
//  qsharp.navigator
//
//  Created by Filip W on 16.12.2023.
//

import Foundation
import CodeEditorView
import LanguageSupport

class CodeExampleModel : ObservableObject {
    @Published var code: String
    @Published var title: String
    
    @Published var shots = 1.0
    @Published var isEditing = false
    @Published var showResults = false
    @Published var position = CodeEditor.Position()
    @Published var messages: Set<TextLocated<Message>> = Set()
    @Published var showMinimap = true
    @Published var wrapText = true
    @Published var isPlaying = false
    
    @Published var executionStates : [ExecutionState] = []
    
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
