import { Items } from "../Models/item";
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage, deleteImage } from "../util";

const addItem = async (req: Request, res: Response) => {
    const { name, description, type, existimagename, amount } = req.body;
    const { id } = req.query;

    const imageBuffer = req.file?.buffer;
    const imageName = uuidv4().substring(0, 10);
    let filename = existimagename;

    if (existimagename && imageBuffer?.length) {
        deleteImage(existimagename);
    }

    if (imageBuffer?.length) {
        filename = `${imageName}.jpg`;
        uploadImage(imageBuffer, filename);
    }
    const itemModel = new Items(id as string, name, filename, description, type, amount);

    try {
        if (id) {
            const result = await itemModel.updateItem();
            res.json(result);
        } else {
            const result = await itemModel.registry();
            res.json(result);
        }
    } catch (e) {
        res.json(e);
    }
}

const deleteItem = async (req: Request, res: Response) => {
    const { existimagename } = req.body;
    const { id } = req.query;
    const itemModel = new Items(id as string);

    try {
        const result = await itemModel.deleteItem();
        if(existimagename) deleteImage(existimagename);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    addItem,
    deleteItem,
}
