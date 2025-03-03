import SwiftUI

struct ResourcesView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 15)  {
                    ForEach(LearningResources.data) { group in
                        Text(group.name)
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding(.leading)
                            .padding(.bottom, 1)
                        
                        ForEach(group.resources) { item in
                                HStack {
                                    VStack(alignment: .leading, spacing: 8) {
                                        HStack {
                                            Image(systemName: "doc.plaintext")
                                                .foregroundColor(.accentColor)
                                            Text(item.name)
                                                .font(.headline)
                                        }
                                        .padding(.bottom, 5)
   
                                        Label {
                                            Text(item.authors.uppercased()).font(.caption).foregroundColor(.secondary)
                                        } icon: {
                                            Image(systemName: "person").foregroundColor(.secondary)
                                        }
                                        Text(item.description).font(.caption2).padding(.leading).padding(.trailing)
                                    }
                                    
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .foregroundColor(.gray)
                                }
                                .padding(.horizontal)
                        }
                        Divider()
                    }
                }
            }
            .padding()
            .navigationTitle("Resources")

        }
    }
}

struct ResourcesView_Previews: PreviewProvider {
    static var previews: some View {
        ResourcesView()
    }
}
