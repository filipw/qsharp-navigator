import SwiftUI

struct DiagnosticsView: View {
    @Binding var diagnostics: [EditorDiagnostic]
    
    var body: some View {
        VStack {
            HStack {
                Spacer()
                Label {
                    Text("Diagnostics")
                        .font(.headline)
                } icon: {
                    Image(systemName: hasErrors ? "exclamationmark.triangle.fill" : "exclamationmark.triangle")
                        .foregroundColor(hasErrors ? .red : .orange)
                }
                Spacer()
            }
            .padding(.top)
            
            Text("\(diagnostics.count) issue\(diagnostics.count == 1 ? "" : "s")")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .padding(.top, 5)
            
            Divider().padding(.horizontal, 50)
            
            List {
                ForEach(diagnostics) { diagnostic in
                    DiagnosticRow(diagnostic: diagnostic)
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                }
            }
            .listStyle(PlainListStyle())
        }
    }
    
    var hasErrors: Bool {
        return diagnostics.contains { $0.severity == .error }
    }
}

struct DiagnosticRow: View {
    var diagnostic: EditorDiagnostic
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: diagnostic.severity.icon)
                .foregroundColor(diagnostic.severity.color)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(diagnostic.message)
                    .font(.body)
                    .foregroundColor(.primary)
                    .fixedSize(horizontal: false, vertical: true)
                
                HStack {
                    Text("Line \(diagnostic.lineNumber):\(diagnostic.column)")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                    
                    if !diagnostic.code.isEmpty {
                        Text("•")
                            .font(.footnote)
                            .foregroundColor(.secondary)
                        
                        Text("Code: \(diagnostic.code)")
                            .font(.footnote)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct DiagnosticsView_Previews: PreviewProvider {
    @State static var sampleDiagnostics: [EditorDiagnostic] = [
        EditorDiagnostic(
            id: UUID(),
            message: "Cannot find name 'foo'",
            severity: .error,
            lineNumber: 5,
            column: 12,
            endLineNumber: 5,
            endColumn: 15,
            code: "CS0103"
        ),
        EditorDiagnostic(
            id: UUID(),
            message: "Unreachable code detected",
            severity: .warning,
            lineNumber: 8,
            column: 5,
            endLineNumber: 8,
            endColumn: 20,
            code: "CS0162"
        )
    ]
    
    static var previews: some View {
        DiagnosticsView(diagnostics: $sampleDiagnostics)
    }
}