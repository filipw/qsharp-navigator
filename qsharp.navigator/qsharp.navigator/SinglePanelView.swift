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
    @ObservedObject var model: CodeExampleModel
    
    var body: some View {
        ScrollView {
            VStack {
                HStack {
                    HStack {
                        Image(systemName: "repeat").foregroundColor(.accentColor)
                        Text("\(Int(model.shots))")
                            .frame(width: 40, alignment: .leading)
                            .foregroundColor(.accentColor)
                    }
                    
                    Slider(value: $model.shots,
                           in: 1...999,
                           onEditingChanged: { editing in
                        model.isEditing = editing
                        }
                    )
                    
                    Spacer()
                    
                    Button(action: {
                        withAnimation {
                            model.runShots()
                        }
                    }, label: {
                        Image(systemName: "play.fill")
                    }).padding()
                        .foregroundColor(.accentColor)
                }
                
                Divider()
                
                CodeEditor(text: $model.code, position: $model.position, messages: $model.messages, layout: CodeEditor.LayoutConfiguration(showMinimap: model.showMinimap, wrapText: model.wrapText))
                    .frame(height: 400)
                
                Divider()
                
                if model.showResults {
                    ExecutionResultView(executionStates: $model.executionStates)
                }
                Spacer()
            }
            .navigationTitle(model.title)
            .padding()
        }
    }
}

struct SinglePanelView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SinglePanelView(model: CodeExampleModel(code: Samples.data[0].samples[0].code, title: Samples.data[0].name))
        }
    }
}

extension ExecutionState: Identifiable {
    public var id: String {
        return UUID().uuidString
    }
}
