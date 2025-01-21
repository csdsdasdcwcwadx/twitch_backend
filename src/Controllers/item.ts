import { Items } from "../Models/item";
import { Request, Response } from 'express';

const addItem = async (req: Request, res: Response) => {
    const { name, image } = req.body;
    const itemModel = new Items(undefined, name, image);
    try {
        const result = await itemModel.registry();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    addItem,
}
