import { getNowTradeDate } from "../util";
import { Request, Response } from 'express';

const opay_payment = require("../opay_payment_nodejs/index.js");
const opay = new opay_payment();

const createOrder = (req: Request, res: Response) => {
    const { name, amount } = req.body;

    const protocol = req.protocol; // 'http' or 'https'
    const host = req.get('host');
    const fullUrl = protocol + host;

    const base_param = {
        MerchantTradeNo: `wsk59ghs910xmhotuzuq`,
        MerchantTradeDate: getNowTradeDate(),
        TotalAmount: amount || '1000',
        TradeDesc: '粉絲抖內',
        ItemName: name || '金幣 1000 顆',
        ReturnURL: `${fullUrl}/payment/testing?userid=${req.userinfo.id}`,
        ChoosePayment: 'ALL',
        EncryptType: 1,
    };
    const formHtml = opay.payment_client.aio_check_out_all(base_param);
    res.send(formHtml);
}

const paymentResult = (req: Request, res: Response) => {
    const data = req.body;
    console.log("收到歐付寶通知：", data);
    res.send("result");
}

export {
    createOrder,
    paymentResult,
}