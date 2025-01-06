import { Books } from "./data";

const resolvers = {
    Query: {
        books: () =>{
            return Books;
        }
    }
}

export default resolvers;