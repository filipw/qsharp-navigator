//
//  SwiftUIView.swift
//  qsharp.navigator
//
//  Created by Filip W on 18.07.23.
//

import SwiftUI
import CodeEditorView
import LanguageSupport

struct SinglePanelView: View {
    @State var code: String
    @State var title: String
    
    @State private var shots = 1.0
    @State private var isEditing = false
    @State private var showResults = false
    @State private var position = CodeEditor.Position()
    @State private var messages: Set<Located<Message>> = Set()
    @State private var showMinimap = true
    @State private var wrapText = true
    @State private var isPlaying = false
    
    @State var executionStates : [ExecutionState] = []
    
    var body: some View {
        ScrollView {
            VStack {
                HStack {
                    HStack {
                        Image(systemName: "repeat").foregroundColor(.accentColor)
                        Text("\(Int(shots))")
                            .frame(width: 40, alignment: .leading)
                            .foregroundColor(.accentColor)
                    }
                    
                    Slider(value: $shots,
                           in: 1...999,
                           onEditingChanged: { editing in
                        isEditing = editing
                    }
                    )
                    
                    Spacer()
                    
                    Button(action: {
                        withAnimation {
                            DispatchQueue.main.async {
                                showResults = false
                            }
                            
                            let results = try! runQsShots(source: code, shots: UInt32(shots))
                            print(results.count)
                            
                            DispatchQueue.main.async {
                                executionStates = results
                                showResults = true
                            }
                        }
                    }, label: {
                        Image(systemName: "play.fill")
                    }).padding()
                        .foregroundColor(.accentColor)
                }
                
                Divider()
                
                CodeEditor(text: $code, position: $position, messages: $messages, layout: CodeEditor.LayoutConfiguration(showMinimap: showMinimap, wrapText: wrapText)).frame(height: 300)
                
                Divider()
                
                if showResults {
                    ExecutionResultView(executionStates: $executionStates)
                }
                Spacer()
            }
            .navigationTitle(title)
            .padding()
        }
    }
}

struct SinglePanelView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SinglePanelView(code: Samples.data[0].samples[0].code, title: Samples.data[0].name)
        }
    }
}

extension ExecutionState: Identifiable {
    public var id: String {
        return UUID().uuidString
    }
}
