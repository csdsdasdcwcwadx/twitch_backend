import { UserItems } from "../Models/userItems";
// import { Checks } from "../Models/check";
import { Request, Response } from 'express';

const ownItem = async (req: Request, res: Response) => {
    // const { checkId, isChecked, passcode } = req.body;
    // const userId = req.userinfo.id;
    // const userChecksModel = new UserChecks(userId, checkId, isChecked);
    // const checkModel = new Checks(checkId, passcode);

    // try {
    //     const currentCheck = await checkModel.getSingleCheck();
    //     if (currentCheck.status) {
    //         if (currentCheck.checkinfo[0].streaming) {
    //             const result = await userChecksModel.registry();
    //             res.json(result);
    //         } else {
    //             throw {
    //                 status: false,
    //                 message: "簽到時間已過",
    //             };
    //         }
    //         return;
    //     }
    //     throw currentCheck;
    // } catch (e) {
    //     res.json(e);
    // }
}

export {
    ownItem,
}