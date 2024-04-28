//
//  ContentView.swift
//  Control
//
//  Created by Yazeed AlKhalaf on 18/04/2024.
//

import SwiftUI

struct Card: Identifiable {
    let id = UUID()
    var balance: Int64
    var currency: String
    var last4Digits: String
}

struct ContentView: View {
    let cards: [Card] = [
        Card(
            balance: Int64(3140),
            currency: "SAR",
            last4Digits: "4039"
        ),
        Card(
            balance: Int64(1853),
            currency: "SAR",
            last4Digits: "0945"
        ),
        Card(
            balance: Int64(144),
            currency: "SAR",
            last4Digits: "1264"
        ),
        Card(
            balance: Int64(146),
            currency: "SAR",
            last4Digits: "2362"
        ),
        Card(
            balance: Int64(953),
            currency: "SAR",
            last4Digits: "1536"
        )
    ]
    
    var body: some View {
        VStack {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(cards) { card in
                        CardComponent(
                            balance: card.balance,
                            currency: card.currency,
                            last4Digits: card.last4Digits
                        )
                        .padding()
                    }
                }
            }
            Spacer()
        }
    }
}

#Preview {
    ContentView()
}
