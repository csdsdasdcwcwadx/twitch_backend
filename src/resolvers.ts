import { I_Users, Users } from "./Models/user";
import { I_Checks, Checks } from "./Models/check";
import { I_Items, Items } from "./Models/item";
import { UserChecks, I_UserChecks } from "./Models/userCheck";
import { UserItems } from "./Models/userItems";
import { I_Redemptions, Redemption } from "./Models/redemption";

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
        },
        getItems: async (root: any, args: { page?: number, pageSize?: number }, context: {token: I_Users}) => {
            const itemModel = new Items();
            const page = args.page || 1; // 預設第 1 頁
            const pagesize = args.pageSize || 10;

            try {
                const items = await itemModel.getItems(true, page, pagesize);
                if (items.status) {
                    return items.iteminfo;
                }
                throw new Error('error');
            } catch (e) {
                return [];
            }
        },
        getAllUsers: async (root: any, args: any, context: {token: I_Users}) => {
            const userModel = new Users();
            try {
                if (!context.token.isAdmin) throw new Error('unauthorized');
                const users = await userModel.getAllUsers();
                if (users.status) {
                    return users.userinfo;
                }
                throw new Error('error');
            } catch (e) {
                return [];
            }
        },
        getRedemptions: async (root: any, args: any, context: {token: I_Users}) => {
            const userID = context.token.id;
            const redemptionModel = new Redemption(undefined, context.token.isAdmin ? undefined : userID);
            const page = args.page || 1; // 預設第 1 頁
            const pagesize = args.pageSize || 10;

            try {
                const redemptionList = await redemptionModel.getRedemptions(page, pagesize);
                if (redemptionList.status) {
                    return redemptionList.redemptioninfo;
                }
                throw new Error('error');
            } catch (e) {
                return [];
            }
        },
        getItemPages: async (root: any, args: { pageSize?: number }, context: {token: I_Users}) => {
            const itemModel = new Items();
            const pagesize = args.pageSize || 10;

            try {
                const items = await itemModel.getPages(true, pagesize);
                if (items.status) {
                    return items.pages;
                }
                throw new Error('error');
            } catch (e) {
                return 0;
            }
        },
        getRedemptionPages: async (root: any, args: { pageSize?: number }, context: {token: I_Users}) => {
            const itemModel = new Redemption();
            const pagesize = args.pageSize || 10;

            try {
                const redemptions = await itemModel.getPages(pagesize);
                if (redemptions.status) {
                    return redemptions.pages;
                }
                throw new Error('error');
            } catch (e) {
                return 0;
            }
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
    },

    Item: {
        userItems: async (item: I_Items, args: any, context: {token: I_Users}) => {
            const userID = context.token.id;
            const userItemModel = new UserItems(context.token.isAdmin ? undefined : userID, item.id);

            try {
                const useritemList = await userItemModel.getUserItems();
                if (useritemList.status) {
                    return useritemList.useriteminfo;
                }
                throw new Error('error');
            } catch(e) {
                return [];
            }
        },
    },

    UserItem: {
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
    },

    Redemption: {
        item: async (redemption: I_Redemptions) => {
            const itemModel = new Items(redemption.item_id);

            try {
                const items = await itemModel.getItems(false);
                if (items.status) {
                    return items.iteminfo[0];
                }
                throw new Error('error');
            } catch(e) {
                return [];
            }
        },
        user: async (redemption: I_Redemptions) => {
            const userModel = new Users(redemption.user_id);

            try {
                const users = await userModel.getUsers();
                if (users.status) {
                    return users.userinfo[0];
                }
                throw new Error('error');
            } catch(e) {
                return [];
            }
        }
    }
}

export default resolvers;