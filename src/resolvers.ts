import { Checks } from "./Models/check";
import { I_Users } from "./Models/user";
import { I_Checks } from "./Models/check";
import { UserChecks } from "./Models/userCheck";

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
            return [context.token];
        }
    },

    Check: {
        userChecks: async (check: I_Checks, args: any, context: {token: I_Users}) => {
            const userID = context.token.id;
            const userChecksModel = new UserChecks(context.token.isAdmin ? undefined : userID);

            try {
                const usercheckList = await userChecksModel.getUserChecks();
                if (usercheckList.status) {
                    return usercheckList.usercheckinfo.filter(usercheck => usercheck.check_id === check.id);
                }
                throw new Error('error');
            } catch(e) {
                return [];
            }
        }
    }
}

export default resolvers;