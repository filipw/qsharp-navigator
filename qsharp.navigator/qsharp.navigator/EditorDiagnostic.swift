//
//  EditorDiagnostic.swift
//  qsharp.navigator
//
//  Created by Filip W on 05.03.2025.
//

import SwiftUI
import WebKit

struct EditorDiagnostic: Identifiable {
    var id = UUID()
    var message: String
    var severity: DiagnosticSeverity
    var lineNumber: Int
    var column: Int
    var endLineNumber: Int
    var endColumn: Int
    var code: String
    
    enum DiagnosticSeverity: String {
        case error = "error"
        case warning = "warning"
        case info = "info"
        case hint = "hint"
        
        var color: Color {
            switch self {
            case .error:
                return Color.red
            case .warning:
                return Color.orange
            case .info, .hint:
                return Color.blue
            }
        }
        
        var icon: String {
            switch self {
            case .error:
                return "exclamationmark.triangle.fill"
            case .warning:
                return "exclamationmark.triangle"
            case .info:
                return "info.circle"
            case .hint:
                return "lightbulb"
            }
        }
    }
}
