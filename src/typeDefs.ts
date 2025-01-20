const typeDefs = `
    type Check {
        id: String
        passcode: String
        created_at: String
        streaming: Boolean
        userChecks: [UserCheck]
    }

    type UserCheck {
        users: User
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

    type Query {
        getChecks: [Check]
        getUsers: User
    }
`;

export default typeDefs;