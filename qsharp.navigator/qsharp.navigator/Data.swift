//
//  Data.swift
//  qsharp.navigator
//
//  Created by Filip W on 18.07.23.
//

import Foundation

struct Sample : Identifiable {
    let id = UUID()
    let name: String
    let code: String
    let difficulty: Int16
}

struct SampleGroup: Identifiable {
    let id = UUID()
    let name: String
    let subtitle: String
    let samples: [Sample]
}

struct Samples {
    static func loadSampleFile(name: String) -> String {
        guard let fileURL = Bundle.main.url(forResource: "Samples/\(name)", withExtension: nil) else {
            print("Error: Could not find file \(name)")
            return ""
        }
        
        do {
            let code = try String(contentsOf: fileURL, encoding: .utf8)
            return code
        } catch {
            print("Error loading file \(name): \(error.localizedDescription)")
            return ""
        }
    }
    
    static let data = [
        SampleGroup(name: "Quantum Computing 101", subtitle: "Basic examples to get you going with quantum programming", samples: [
            Sample(name: "basic.qs", code: loadSampleFile(name: "basic.qs"), difficulty: 1),
        ]),
        SampleGroup(name: "Entanglement", subtitle: "Dive deep into spooky action at a distance", samples: [
            Sample(name: "entanglement.qs", code: loadSampleFile(name: "entanglement.qs"), difficulty: 1),
            Sample(name: "teleportation.qs", code: loadSampleFile(name: "teleportation.qs"), difficulty: 3)
        ])
    ]
}
