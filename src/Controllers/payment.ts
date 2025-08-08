import { getNowTradeDate } from "../util";
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Users } from "../Models/user";

interface I_OpayResponse {
    MerchantID: string;
    MerchantTradeNo: string;
    PayAmt: string;
    PaymentDate: string;
    PaymentType: string;
    PaymentTypeChargeFee: string;
    RedeemAmt: string;
    RtnCode: string;
    RtnMsg: string;
    SimulatePaid: string;
    TradeAmt: string;
    TradeDate: string;
    TradeNo: string;
    CheckMacValue: string;
}

const opay_payment = require("../opay_payment_nodejs/index.js");
const opay = new opay_payment();

const createOrder = async (req: Request, res: Response) => {
    const { name, amount } = req.body;

    // handle uuid
    const uuid = uuidv4().replace(/-/g, ''); // 拿掉破折號
    const shortId = uuid.slice(0, 20);

    // handle protocol
    const fullUrl = req.protocol + "://" + req.get('host');

    const base_param = {
        MerchantTradeNo: shortId,
        MerchantTradeDate: getNowTradeDate(),
        TotalAmount: amount || '1000',
        TradeDesc: '粉絲抖內',
        ItemName: name || '金幣 1000 顆',
        ReturnURL: `${process.env.ENV === "prod" ? fullUrl : "https://2bbe092e0670.ngrok-free.app"}/payment/paymentresult?userid=${req.userinfo.id}`, // 需要是公開的網段 (不能是localhost)
        ClientBackURL: process.env.APP_HOST,
        ChoosePayment: 'ALL',
        EncryptType: 1,
    };
    const formHtml = opay.payment_client.aio_check_out_all(base_param);
    res.send(formHtml);
}

const paymentResult = async (req: Request, res: Response) => {
    const data = req.body as I_OpayResponse;
    const userId = req.query.userid as string;

    try {
        if (data.RtnCode !== '1') throw {
            status: false,
            message: "交易失敗",
        }
        const userModel = new Users(userId, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
        const result = await userModel.setGaming();
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

export {
    createOrder,
    paymentResult,
}