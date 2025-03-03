//
//  MainView.swift
//  qsharp.navigator
//
//  Created by Filip W on 26.07.23.
//

import SwiftUI

struct MainView: View {
    var body: some View {
        TabView {
            ExploreView()
                .tabItem {
                    Label("Explore", systemImage: "house")
                }
            ResourcesView()
                .tabItem {
                    Label("Resources", systemImage: "books.vertical")
                }
        }
        //.accentColor(Color("MainColor"))
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
