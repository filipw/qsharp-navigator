//
//  DifficultyView.swift
//  qsharp.navigator
//
//  Created by Filip W on 26.07.23.
//

import SwiftUI

struct DifficultyView: View {
    let rating: Int16
    
    var body: some View {
        HStack(spacing: 2) {
            ForEach((1 ..< 6).map { num in (Int16(num), UUID()) }, id: \.1) { number, _ in
                Image(systemName: "star.fill")
                    .font(.caption2)
                    .foregroundColor(number == 0 || number > self.rating ? Color.gray : Color.accentColor)
            }
        }
    }
}

struct DifficultyView_Previews: PreviewProvider {
    static var previews: some View {
        DifficultyView(rating: 3)
    }
}
