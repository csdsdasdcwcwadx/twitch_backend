import { Items } from "../Models/item";
import { Redemption } from "../Models/redemption";
import { UserItems } from "../Models/userItems";
import { Request, Response } from 'express';

const exchange = async (req: Request, res: Response) => {
    const { itemId, amount } = req.body;
    const userId = req.userinfo.id;

    const userItemModel = new UserItems(userId, itemId, amount);
    const ItemModels = new Items(itemId);

    try {
        const userItems = await userItemModel.getUserItems();
        const item = await ItemModels.getItems(false);

        if (userItems.status && item.status) {
            const itemCount = Number(amount/item.iteminfo[0].amount!); // 共可以兌換幾個商品

            // 代表使用者持有的數量大於請求的數量
            if (userItems.useriteminfo[0].amount! >= amount) {
                userItemModel.amount = userItems.useriteminfo[0].amount! - (itemCount * (item.iteminfo[0].amount!) + amount % item.iteminfo[0].amount!);
                const userItemResult = await userItemModel.updateUserItems(); // 刪除使用者持有的道具數量

                const redemptionModel = new Redemption(undefined, userId, itemId, undefined, itemCount);
                const RedempResult = await redemptionModel.registry(); // 註冊兌換的商品

                res.json(RedempResult);
                return;
            }
            throw {
                status: false,
                message: "使用者持有數量不足",
            }
        }
    } catch (e) {
        res.json(e);
    }
}

const updateStatus = async (req: Request, res: Response) => {
    const { redemptionId, status } = req.body;
    const redemptionModel = new Redemption(redemptionId, undefined, undefined, status);

    try {
        const result = await redemptionModel.update();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    exchange,
    updateStatus,
}