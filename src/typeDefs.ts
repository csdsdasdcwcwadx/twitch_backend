const typeDefs = `
    type Check {
        id: String
        passcode: String
        created_at: String
        streaming: Boolean
        userChecks: [UserCheck]
    }

    type UserCheck {
        user: User
        check_id: String
        checked: Boolean
        created_at: String
    }

    type User {
        id: String
        twitch_id: String
        login: String
        name: String
        email: String
        profile_image: String
        isAdmin: Boolean
    }

    type Item {
        id: String
        name: String
        image: String
        description: String
        type: String
        created_at: String
        userItems: [UserItem]
    }

    type UserItem {
        user: User
        amount: Int
        created_at: String
    }

    type Query {
        getChecks: [Check]
        getUsers: User
        getItems: [Item]
        getAllUsers: [User]
    }
`;

export default typeDefs;