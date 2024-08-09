//
//  CardBody.swift
//  Control
//
//  Created by Yazeed AlKhalaf on 28/04/2024.
//

import SwiftUI

struct CardBody: View {
    var tintColor: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading) {
                Text("Card Settings")
                    .font(.title)
                Text("Here you can manage your card in cool ways :D")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Divider()
            CardBodyEntry(
                imageSystemName: "list.clipboard",
                title: "View Transactions",
                subtitle: "See the things you spent money on"
            ) {
                print("clicked top up")
            }
            Divider()
            CardBodyEntry(
                imageSystemName: "plus.app",
                title: "Add Money",
                subtitle: "Add money to the card"
            ) {
                print("clicked top up")
            }
            CardBodyEntry(
                imageSystemName: "lock",
                title: "Lock Card",
                subtitle: "Disables the ability to use the card"
            ) {
                print("clicked lock card")
            }
            CardBodyEntry(
                imageSystemName: "gauge.medium",
                title: "Manage Limit",
                subtitle: "Choose the amount the card is allowed to spend"
            ) {
                print("clicked manage limit")
            }
        }
        .tint(tintColor)
        .padding()
        .padding(.horizontal, 8)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(16)
    }
}

#Preview {
    CardBody(tintColor: .indigo)
        .safeAreaPadding(.all)
}
