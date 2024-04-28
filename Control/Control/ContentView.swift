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
    @State private var currentPage: Int = 0
    
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
            TabView(selection: $currentPage) {
                ForEach(cards.indices, id: \.self) { index in
                    let card = cards[index]
                    CardComponent(
                        balance: card.balance,
                        currency: card.currency,
                        last4Digits: card.last4Digits
                    )
                    .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .always))
            .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
            .frame(height: 300)
            
            Spacer()
            Text("Selected Card Details: \(cards[currentPage].last4Digits)")
            Spacer()
        }
    }
}

#Preview {
    ContentView()
}
