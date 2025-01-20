import { I_Users, Users } from "./Models/user";
import { I_Checks, Checks } from "./Models/check";
import { UserChecks, I_UserChecks } from "./Models/userCheck";

const resolvers = {
    Query: {
        getChecks: async (root: any, args: any, context: any) => {
            const today = new Date();
            const checksModel = new Checks();

            try {
                const checkList = await checksModel.getall(today.getFullYear(), today.getMonth() + 1);
                if (checkList.status) {
                    return checkList.checkinfo;
                }
                throw new Error('error');
            } catch (e) {
                return [];
            }
        },
        getUsers: async (root: any, args: any, context: {token: I_Users}) => {
            return context.token;
        }
    },

    Check: {
        userChecks: async (check: I_Checks, args: any, context: {token: I_Users}) => {
            const userID = context.token.id;
            // 用戶只能看到自己的簽到
            const userChecksModel = new UserChecks(context.token.isAdmin ? undefined : userID, check.id);

            try {
                const usercheckList = await userChecksModel.getUserChecks();
                if (usercheckList.status) {
                    return usercheckList.usercheckinfo;
                }
                throw new Error('error');
            } catch(e) {
                return [];
            }
        },
    },

    UserCheck: {
        user: async (usercheck: I_UserChecks, args: any, context: {token: I_Users}) => {
            const userModel = new Users(usercheck.user_id);

            try {
                if (!context.token.isAdmin) throw new Error("cannot get users");
                const result = await userModel.getUsers();
                if (result.status) {
                    return result.userinfo[0];
                }
                throw new Error('error');
            } catch(e) {
                return [];
            }
        }
    }
}

export default resolvers;