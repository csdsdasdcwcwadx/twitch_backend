import { Checks } from "./Models/check";
import { UserChecks } from "./Models/userCheck";

const resolvers = {
    Query: {
        getChecks: async () => {
            const checksModel = new Checks();
            const checkList = await checksModel.getall();
            if (checkList.status) {
                return checkList.checkinfo;
            }
            return [];
        },
    },
    Mutation: {
        getUserChecks: async (_: any, { userID }: { userID: string }) => {
            const userChecksModel = new UserChecks(userID);
            const checks = await userChecksModel.getUserChecks();
            if (checks.status) {
                return checks.usercheckinfo;
            }
            return [];
        }
    }
}

export default resolvers;