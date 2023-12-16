//
//  ContentView.swift
//  qsharp.navigator
//
//  Created by Filip W on 17.07.23.
//

import SwiftUI

struct ExploreView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 15)  {
                    ForEach(Samples.data) { group in
                        Text(group.name)
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding(.leading)
                            .padding(.bottom, 1)
                        
                        Text(group.subtitle)
                            .font(.caption2)
                            .padding(.leading)
                            .padding(.trailing)
                        
                        ForEach(group.samples) { item in
                            NavigationLink(destination: SinglePanelView(model: CodeExampleModel(code: item.code, title: item.name))) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 8) {
                                        HStack {
                                            Image(systemName: "doc.plaintext")
                                                .foregroundColor(.accentColor)
                                            Text(item.name)
                                                .font(.headline)
                                        }
                                        .padding(.bottom, 5)
                                        
                                        DifficultyView(rating: item.difficulty)
                                    }
                                    
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .foregroundColor(.gray)
                                }
                                .padding(.horizontal)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                        Divider()
                    }
                }
            }
            .padding()
            .navigationTitle("Explore")

        }
    }
}

struct ExploreView_Previews: PreviewProvider {
    static var previews: some View {
        ExploreView()
    }
}
