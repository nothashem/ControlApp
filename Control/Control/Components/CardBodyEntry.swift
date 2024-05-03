//
//  CardBodyEntry.swift
//  Control
//
//  Created by Yazeed AlKhalaf on 28/04/2024.
//

import SwiftUI

struct CardBodyEntry: View {
    var imageSystemName: String
    var title: String
    var subtitle: String
    var action: () -> Void
    
    var body: some View {
        Button(action: action, label: {
            HStack {
                Image(systemName: imageSystemName)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 22)
                VStack(alignment: .leading) {
                    Text(title)
                        .font(.headline)
                        .multilineTextAlignment(.leading)
                    Text(subtitle)
                        .font(.caption)
                        .multilineTextAlignment(.leading)
                }
            }
        })
    }
}

#Preview {
    CardBodyEntry(
        imageSystemName: "lock",
        title: "Lock Card",
        subtitle: "Disables the ability to use the card"
    ) {
        print("clicked lock card")
    }
}
