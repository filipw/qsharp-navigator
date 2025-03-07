import SwiftUI

struct SinglePanelView: View {
    @ObservedObject var model: CodeExampleModel
    
    var body: some View {
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
                    if model.isPlaying {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                            .foregroundColor(.accentColor)
                    } else {
                        Image(systemName: "play.fill")
                            .foregroundColor(.accentColor)
                    }
                })
                .padding()
                .disabled(model.isPlaying)
            }
            
            Divider()
            
            QSharpMonacoEditor(
                text: $model.code,
                position: $model.editorPosition,
                diagnostics: $model.diagnostics,
                layout: QSharpMonacoEditor.LayoutConfiguration(
                    showMinimap: model.showMinimap,
                    wrapText: model.wrapText
                )
            )
            .frame(minHeight: 300)
            .layoutPriority(1)
            
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Spacer()
                        
                        Button(action: {
                            model.showResultsSheet = true
                        }) {
                            Label("Results", systemImage: "list.clipboard")
                                .foregroundColor(model.hasResults ? .accentColor : .gray)
                        }
                        .disabled(!model.hasResults)
                        
                        Spacer()
                        
                        Button(action: {
                            model.showDiagnosticsSheet = true
                        }) {
                            Label {
                                Text("Diagnostics")
                            } icon: {
                                Image(systemName: model.hasErrors ? "exclamationmark.triangle.fill" : "exclamationmark.triangle")
                                    .foregroundColor(model.hasDiagnostics ? (model.hasErrors ? .red : .orange) : .gray)
                            }
                        }
                        .disabled(!model.hasDiagnostics)
                        
                        Spacer()
                    }
                    .padding(.bottom, 5)
                }
            }
            .padding()
        }
        .navigationTitle(model.title)
        .padding()
        .sheet(isPresented: $model.showResultsSheet) {
            ExecutionResultView(executionStates: $model.executionStates)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Done") {
                            model.showResultsSheet = false
                        }
                    }
                }.presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $model.showDiagnosticsSheet) {
            DiagnosticsView(diagnostics: $model.diagnostics)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Done") {
                            model.showDiagnosticsSheet = false
                        }
                    }
                }
                .presentationDetents([.medium, .large])
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
