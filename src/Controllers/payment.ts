import { getNowTradeDate } from "../util";
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Users } from "../Models/user";
import { broadcastAlert, setDonate, donate } from "../util";

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
};
type I_PaymentType = "ecpay" | "opay";
const ecpay_payment = require("ecpay_aio_nodejs");

const URL_MAP = {
    dev: {
        ecpay: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
        opay: 'https://payment-stage.opay.tw/Cashier/AioCheckOut/V5',
    },
    prod: {
        ecpay: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
        opay: 'https://payment.opay.tw/Cashier/AioCheckOut/V5',
    },
};

function replaceEcpayFormActionUrl(formHtml: string, type: I_PaymentType): string {
    const env = process.env.ENV === "prod" ? "prod" : "dev";
    const urls = URL_MAP[env];

    return formHtml.replace(urls.ecpay, urls[type]);
}

const ecpay = new ecpay_payment({
    IgnorePayment: [], // Alipay#TWQR#BARCODE#Tenpay#IBON#CreditInstallment
    OperationMode: process.env.ENV === "dev" ? "Test" : "Production",
    IsProjectContractor: "N",
    MercProfile: {
        MerchantID: process.env.MERCHANT_ID,
        HashIV: process.env.HASHIV,
        HashKey: process.env.HASHKEY,
    }
});

const createOrder = async (req: Request, res: Response) => {
    const { name, amount, type, backURL, message } = req.body;

    // handle uuid
    const uuid = uuidv4().replace(/-/g, ''); // 拿掉破折號
    const shortId = uuid.slice(0, 20);
    setDonate({
        DonateNickName: name,
        DonateAmount: amount,
        DonateMsg: message,
    });

    // handle protocol
    const fullUrl = req.protocol + "://" + req.get('host');

    try {
        const base_param = {
            MerchantID: process.env.MERCHANT_ID, //
            MerchantTradeNo: shortId,
            MerchantTradeDate: getNowTradeDate(),
            TotalAmount: amount,
            TradeDesc: '粉絲抖內',
            ItemName: name,
            ReturnURL: `${process.env.ENV === "prod" ? `${fullUrl}/payment/paymentresult?userid=${req.userinfo.id}` : "https://4fe23be226e6.ngrok-free.app"}/payment/paymentresult?userid=${req.userinfo.id}`, // 需要是公開的網段 (不能是localhost)
            ClientBackURL: backURL,
            ChoosePayment: 'ALL',
            EncryptType: 1,
            PaymentType: "aio" //
        };
        const formHtml = ecpay.payment_client.aio_check_out_all(base_param);
        res.send(replaceEcpayFormActionUrl(formHtml, type));
    } catch (e) {
        setDonate({
            DonateNickName: "",
            DonateAmount: "",
            DonateMsg: "",
        });
        res.json({
            status: false,
            message: "建立訂單失敗",
        });
    }
}

const paymentResult = async (req: Request, res: Response) => {
    const data = req.body as I_OpayResponse;
    const userId = req.query.userid as string;
    console.log(data)

    try {
        if (data.RtnCode !== '1') throw {
            status: false,
            message: "交易失敗",
        }
        const userModel = new Users(userId, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
        broadcastAlert();
        setDonate({
            DonateNickName: "",
            DonateAmount: "",
            DonateMsg: "",
        });
        const result = await userModel.setGaming();
        res.json(result);
    } catch (e) {
        setDonate({
            DonateNickName: "",
            DonateAmount: "",
            DonateMsg: "",
        });
        res.json(e);
    }
}

export {
    createOrder,
    paymentResult,
}