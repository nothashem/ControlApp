//
//  CardComponent.swift
//  Control
//
//  Created by Yazeed AlKhalaf on 28/04/2024.
//

import SwiftUI

struct CardComponent: View {
    var balance: Int64
    var currency: String
    var last4Digits: String
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Spacer()
                Image(.visaLogo)
            }
            Spacer()
            Spacer()
            Spacer()
            Spacer()
            Spacer()
            VStack(alignment: .leading) {
                Text("Balance")
                    .font(.subheadline)
                Text("\(currency) \(balance)")
                    .font(.headline)
            }
            Spacer()
            Text("**** \(last4Digits)")
                .font(.subheadline)
        }
        .padding()
        .frame(width: 190, height: 240)
        .background(
            LinearGradient(
                gradient: Gradient(
                    colors: [.red, .yellow]
                ),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .foregroundStyle(.white)
        .cornerRadius(16)
    }
}

#Preview {
    CardComponent(
        balance: Int64(19249),
        currency: "SAR",
        last4Digits: "8976"
    )
}
