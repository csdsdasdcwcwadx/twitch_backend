import { UserChecks } from "../Models/userCheck";
import { Checks } from "../Models/check";
import { Items } from "../Models/item";
import { UserItems } from "../Models/userItems";
import { Request, Response } from 'express';

const checked = async (req: Request, res: Response) => {
    const { checkId, isChecked, passcode } = req.body;
    const userId = req.userinfo.id;
    const userChecksModel = new UserChecks(userId, checkId, isChecked);
    const checkModel = new Checks(checkId, passcode);
    const itemModel = new Items();

    try {
        const currentCheck = await checkModel.getSingleCheck();
        const getItems = await itemModel.getItems(true, 1, 1, false);

        if (currentCheck.status && getItems.status) {
            const allitems = getItems.iteminfo;
            if (currentCheck.checkinfo[0].streaming) { // 成功簽到
                const userItemModel = new UserItems(userId, allitems[allitems.length - 1].id, 1);

                const userItemResult = await userItemModel.registry();
                const userCheckResult = await userChecksModel.registry();
                res.json(userCheckResult);
            } else {
                throw {
                    status: false,
                    message: "簽到時間已過",
                };
            }
            return;
        }
        throw currentCheck;
    } catch (e) {
        res.json(e);
    }
}

export {
    checked,
}