import SwiftUI

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
                
                MonacoEditor(
                    text: $model.code,
                    position: $model.editorPosition,
                    layout: MonacoEditor.LayoutConfiguration(
                        showMinimap: model.showMinimap,
                        wrapText: model.wrapText
                    )
                )
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
