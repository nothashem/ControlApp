//
//  ContentView.swift
//  Control
//
//  Created by Yazeed AlKhalaf on 18/04/2024.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
            
            CardComponent(balance: Int64(1560), currency: "SAR", last4Digits: "3429")
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
