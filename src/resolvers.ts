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
        getUserChecks: async () => {
            const userChecksModel = new UserChecks();
            const checks = await userChecksModel.getUserChecks();
            if (checks.status) {
                return checks.usercheckinfo;
            }
            return [];
        }
    }
}

export default resolvers;