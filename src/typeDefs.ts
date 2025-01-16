const typeDefs = `
    type Check {
        id: String
        passcode: String
        created_at: String
        streaming: Boolean
        userChecks: [UserCheck]
    }

    type UserCheck {
        user_id: String
        check_id: String
        checked: Boolean
        created_at: String
    }

    type Query {
        getChecks: [Check]
    }
`;

export default typeDefs;