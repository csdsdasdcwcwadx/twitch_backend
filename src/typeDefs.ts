const typeDefs = `
    type Book {
        id: ID
        name: String
        author: String
        publish: String
    }
    
    type Query {
        books: [Book]
    }
`

export default typeDefs;