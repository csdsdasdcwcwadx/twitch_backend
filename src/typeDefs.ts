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
        realname: String
        address: String
        phone: String
        isAdmin: Boolean
        isGaming: Boolean
        created_at: String
    }

    type Item {
        id: String
        name: String
        image: String
        description: String
        type: String
        amount: Int
        created_at: String
        userItems: [UserItem]
    }

    type UserItem {
        user: User
        amount: Int
        created_at: String
    }

    type Redemption {
        id: String
        amount: Int
        created_at: String
        status: Boolean
        item: Item
        user: User
    }

    type Query {
        getChecks(year: String, month: String): [Check]
        getUsers: User
        getItems(page: Int, pageSize: Int): [Item]
        getAllUsers: [User]
        getRedemptions(page: Int, pageSize: Int): [Redemption]
        getItemPages(pageSize: Int): Int
        getRedemptionPages(pageSize: Int): Int
    }
`;

export default typeDefs;