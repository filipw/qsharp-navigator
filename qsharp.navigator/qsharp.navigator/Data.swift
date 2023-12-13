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
    static let data = [
        SampleGroup(name: "Quantum Computing 101", subtitle: "Basic examples to get you going with quantum programming", samples: [
            Sample(name: "basic.qs", code: """
    namespace MyQuantumApp {
        @EntryPoint()
            operation Main() : Unit {
            Message("Hello");
        }
    }
    """, difficulty: 1),
        ]),
        SampleGroup(name: "Entanglement", subtitle: "Dive deep into spooky action at a distance", samples: [
            Sample(name: "entanglement.qs", code: """
    namespace Demos {

        open Microsoft.Quantum.Intrinsic;
        open Microsoft.Quantum.Measurement;
        open Microsoft.Quantum.Diagnostics;

        @EntryPoint()
        operation Run() : (Result, Result) {
            use (control, target) = (Qubit(), Qubit());

            H(control);
            CNOT(control, target);
            
            DumpMachine();

            let resultControl = MResetZ(control);
            let resultTarget = MResetZ(target);
            return (resultControl, resultTarget);
        }
    }
    """, difficulty: 1),
            Sample(name: "teleportation.qs", code: """
    namespace teleportation {

        open Microsoft.Quantum.Arrays;
        open Microsoft.Quantum.Canon;
        open Microsoft.Quantum.Convert;
        open Microsoft.Quantum.Intrinsic;
        open Microsoft.Quantum.Math;
        open Microsoft.Quantum.Measurement;
        open Microsoft.Quantum.Random;

        @EntryPoint()
        operation Start() : Bool {
            use (message, resource, target) = (Qubit(), Qubit(), Qubit());
            PrepareState(message);

            Teleport(message, resource, target);
            Adjoint PrepareState(target);
            let outcome = M(target) == Zero;
            Message($"Teleported: {outcome}");
            return outcome;
        }

        operation Teleport(message : Qubit, resource : Qubit, target : Qubit) : Unit {
            // create entanglement between resource and target
            H(resource);
            CNOT(resource, target);

            // reverse Bell circuit on message and resource
            CNOT(message, resource);
            H(message);

            // mesaure message and resource
            let messageResult = MResetZ(message) == One;
            let resourceResult = MResetZ(resource) == One;

            // and decode state
            DecodeTeleportedState(messageResult, resourceResult, target);
        }

        operation PrepareState(q : Qubit) : Unit is Adj + Ctl {
            Rx(1. * PI() / 2., q);
            Ry(2. * PI() / 3., q);
            Rz(3. * PI() / 4., q);
        }

        operation DecodeTeleportedState(messageResult : Bool, resourceResult : Bool, target : Qubit) : Unit {
            if not messageResult and not resourceResult {
                I(target);
            }
            if not messageResult and resourceResult {
                X(target);
            }
            if messageResult and not resourceResult {
                Z(target);
            }
            if messageResult and resourceResult {
                Z(target);
                X(target);
            }
        }
    }
    """, difficulty: 3)
        ])
    ]
}
