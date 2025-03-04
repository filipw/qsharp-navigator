import SwiftUI
import SafariServices

struct ResourcesView: View {
    @State private var selectedURL: URL?
    
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
                                Button(action: {
                                    if let url = URL(string: item.link) {
                                        self.selectedURL = url
                                    }
                                }) {
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
                                }
                                .buttonStyle(PlainButtonStyle())
                                .padding(.horizontal)
                        }
                        Divider()
                    }
                }
            }
            .padding()
            .navigationTitle("Resources")
            .sheet(item: $selectedURL) { url in
                SafariView(url: url)
            }
        }
    }
}

extension URL: @retroactive Identifiable {
    public var id: String {
        return self.absoluteString
    }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL
    
    func makeUIViewController(context: UIViewControllerRepresentableContext<SafariView>) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: UIViewControllerRepresentableContext<SafariView>) {
    }
}

struct ResourcesView_Previews: PreviewProvider {
    static var previews: some View {
        ResourcesView()
    }
}
