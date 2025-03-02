import { UserItems } from "../Models/userItems";
import { Request, Response } from 'express';

const ownItem = async (req: Request, res: Response) => {
    const { userId, itemId, amount } = req.body;
    const userItemModel = new UserItems(userId, itemId, amount);

    try {
        const result = await userItemModel.registry();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    ownItem,
}