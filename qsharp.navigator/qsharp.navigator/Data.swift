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
struct LearningResource: Identifiable {
    let id = UUID()
    let name: String
    let authors: String
    let description: String
    let link: String
}

struct LearningResourceGroup: Identifiable {
    let id = UUID()
    let name: String
    let subtitle: String
    let resources: [LearningResource]
}

struct LearningResources {
    static let data = [
        LearningResourceGroup(
            name: "General QC Books",
            subtitle: "Essential reading materials for quantum computing",
            resources: [
                LearningResource(
                    name: "Quantum Computation and Quantum Information",
                    authors: "Nielsen M, Chuang I.",
                    description: "Nielsen & Chuang’s seminal textbook that lays the groundwork for quantum computing.",
                    link: "https://www.example.com/quantum-computation-and-quantum-information"
                ),
                LearningResource(
                    name: "Quantum Computing: An Applied Approach",
                    authors: "Foo A., Bar Z.",
                    description: "A practical introduction to quantum computing concepts with real-world examples.",
                    link: "https://www.example.com/quantum-computing-an-applied-approach"
                )
            ]
        ),
        
        LearningResourceGroup(
            name: "Q# Books",
            subtitle: "Books focusing on Q#",
            resources: [
                LearningResource(
                    name: "Introduction to Quantum Computing with Q# and QDK",
                    authors: "Wojcieszyn F.",
                    description: "A practical introduction to Q# and quantum computing",
                    link: "https://www.example.com/quantum-computation-and-quantum-information"
                ),
                LearningResource(
                    name: "Q#: An Applied Approach",
                    authors: "Foo B.",
                    description: "A practical introduction to quantum computing concepts with real-world examples.",
                    link: "https://www.example.com/quantum-computing-an-applied-approach"
                )
            ]
        ),
        
        LearningResourceGroup(
            name: "Documentation",
            subtitle: "Official guides, API references, and manuals",
            resources: [
                LearningResource(
                    name: "Q# Documentation",
                    authors: "Microsoft",
                    description: "The official documentation for Q#, including tutorials, samples, and API references.",
                    link: "https://docs.microsoft.com/quantum/"
                )
            ]
        ),
        
        LearningResourceGroup(
            name: "Research Papers",
            subtitle: "Cutting-edge research and studies in quantum computing",
            resources: [
                LearningResource(
                    name: "Q#: Enabling scalable quantum computing and development with a high-level domain-specific language",
                    authors: "Svore K et al.",
                    description: "Q# introductory paper",
                    link: "http://arxiv.org/abs/1803.00652"
                ),
                LearningResource(
                    name: "Shor's Algorithm",
                    authors: "Shor P.",
                    description: "The original paper outlining the quantum algorithm for integer factorization.",
                    link: "https://www.example.com/shors-algorithm"
                )
            ]
        ),
    ]
}
