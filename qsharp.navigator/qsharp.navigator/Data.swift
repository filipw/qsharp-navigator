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
                    link: "https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E10196D0A682A6AEFFEA52D53BE9AE#overview"
                ),
                LearningResource(
                    name: "Quantum Computer Science: An Introduction",
                    authors: "Mermin D. N.",
                    description: "This book is a concise introduction to quantum computation, developing the basic elements of this new branch of computational theory without assuming any background in physics.",
                    link: "https://www.cambridge.org/core/books/quantum-computer-science/66462590D10C8010017CF1D7C45708D7"
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
                    description: "Introduces the basic ideas of quantum mechanics through the lens of quantum programming with Q#",
                    link: "https://link.springer.com/book/10.1007/978-3-030-99379-5"
                ),
                LearningResource(
                    name: "Q# Pocket Guide",
                    authors: "Mykhailova M.",
                    description: "Basic Q# concepts in a pocket-sized guide.",
                    link: "https://www.oreilly.com/library/view/q-pocket-guide/9781098108854"
                ),
                LearningResource(
                    name: "Learn Quantum Computing with Python and Q#",
                    authors: "Kaiser S, Granade C.",
                    description: "Using Python and the new quantum programming language Q#, you’ll build your own quantum simulator and apply quantum programming techniques to real-world examples including cryptography and chemical analysis.",
                    link: "https://www.manning.com/books/learn-quantum-computing-with-python-and-q-sharp"
                )
            ]
        ),
        
        LearningResourceGroup(
            name: "Documentation & Code",
            subtitle: "Official guides, API references, and manuals",
            resources: [
                LearningResource(
                    name: "Q# Documentation",
                    authors: "Microsoft",
                    description: "The official documentation for Q#, including tutorials, samples, and API references.",
                    link: "https://learn.microsoft.com/en-us/azure/quantum/qsharp-overview"
                ),
                LearningResource(
                    name: "Azure Quantum Documentation",
                    authors: "Microsoft",
                    description: "The official documentation for Azure Quantum, the cloud platform for Q#",
                    link: "https://learn.microsoft.com/en-us/azure/quantum/overview-azure-quantum"
                )
                
            ]
        ),
        
        LearningResourceGroup(
            name: "Research Papers",
            subtitle: "Important papers related to Q#",
            resources: [
                LearningResource(
                    name: "Q#: Enabling scalable quantum computing and development with a high-level domain-specific language",
                    authors: "Svore K et al.",
                    description: "The paper introduces Q#, a domain-specific language designed to precisely and safely express quantum algorithms while integrating classical and quantum computations.",
                    link: "http://arxiv.org/abs/1803.00652"
                ),
                LearningResource(
                    name: "Q# as a Quantum Algorithmic Language",
                    authors: "Singhal K. et al",
                    description: "The paper introduces λ₍Q#₎, a formal, mathematically grounded model of Microsoft's Q# language that clarifies its design and ensures type safety.",
                    link: "http://arxiv.org/abs/2206.03532"
                ),
                LearningResource(
                    name: "Teaching Quantum Computing through a Practical Software-driven Approach: Experience Report",
                    authors: "Mykhailova M. et al",
                    description: "The paper introduces λ₍Q#₎, a formal, mathematically grounded model of Microsoft's Q# language that clarifies its design and ensures type safety.",
                    link: "http://arxiv.org/abs/2010.07729"
                )
                
            ]
        ),
    ]
}
