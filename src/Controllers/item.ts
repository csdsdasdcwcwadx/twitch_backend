import { Items } from "../Models/item";
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage } from "../util";

const addItem = async (req: Request, res: Response) => {
    const { name, description, type } = req.body;
    const imageBuffer = req.file?.buffer;
    const imageName = uuidv4().substring(0, 10);
    let filename = '';

    if (imageBuffer) {
        filename = `${imageName}.jpg`;
        uploadImage(imageBuffer, filename);
    }
    const itemModel = new Items(undefined, name, filename, description, type);

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
