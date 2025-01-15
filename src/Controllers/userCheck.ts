import { UserChecks } from "../Models/userCheck";
import { Request, Response } from 'express';

const checked = async (req: Request, res: Response) => {
    const { checkId, isChecked } = req.body;
    const userId = req.userinfo.id;
    const userChecksModel = new UserChecks(userId, checkId, isChecked);

    try {
        const result = await userChecksModel.registry();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    checked,
}