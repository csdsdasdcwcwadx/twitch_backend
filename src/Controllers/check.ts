import { Checks } from "../Models/check";
import { Request, Response } from 'express';

const addCheck = async (req: Request, res: Response) => {
    const { passcode } = req.body;
    const checkModel = new Checks(undefined, passcode);
    try {
        const result = await checkModel.registry();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

const updateCheckStatus = async (req: Request, res: Response) => {
    const { streaming, checkId } = req.body;
    const checkModel = new Checks(checkId, undefined, streaming);
    try {
        const result = await checkModel.updateStreaming();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    addCheck,
    updateCheckStatus,
}