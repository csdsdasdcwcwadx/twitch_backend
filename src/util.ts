import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { I_Users, Users } from './Models/user';
import { IncomingMessage, Server } from 'http';
import * as cookie from 'cookie';
import WebSocket, { WebSocketServer } from 'ws';

export const ACCESS_SECRET_KEY = uuidv4();
export const REFRESH_SECRET_KEY = uuidv4();

const clientsQueue = new Set<WebSocket>();
const adminQueue = new Set<WebSocket>();
const alertClients = new Set<WebSocket>();

export const accessTime = '15m';
export const refreshTime = '10h';

export const cookieDomain = process.env.ENV === 'prod' ? '' : '';

export const adminRoutes = [
    // check
    '/check/addcheck',
    '/check/updatecheckstatus',
    // item
    '/item/additem',
    '/item/deleteitem',
    // useritem
    '/useritem/ownitem',
    // redemption
    '/redemp/update',
];
export const frontPages = ['/check', '/game', '/pack', '/exchange'];
export const ignoreRoutes = [
    '/member/login',
    '/payment/paymentresult',
    '/alert',
];
 
export const authMiddleWare = async (req: Request, res: Response, next: Function) => {
    console.log(`[API] ${req.method} ${req.path}`);

    const accessToken: string = req.cookies.access;
    const refreshToken: string = req.cookies.refresh;
    if (ignoreRoutes.includes(req.path)) {
        next();
        return;
    }
    if (req.path === "/" && (!accessToken || !refreshToken)) {
        res.clearCookie('refresh', {
            httpOnly: true,
            secure: true,
            domain: cookieDomain,
        });
        res.clearCookie('access', {
            httpOnly: true,
            secure: true,
            domain: cookieDomain,
        });
        res.clearCookie('twitch', {
            httpOnly: true,
            secure: true,
            domain: cookieDomain,
        });
        res.json({
            status: false,
            message: '請登入',
        });
        return;
    }

    try {
        if (!accessToken || !refreshToken) throw new Error('cannot find refresh token or access token');
        jwt.verify(accessToken, ACCESS_SECRET_KEY, (err, userinfo) => {
            if (err) {
                const userinfo = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as JwtPayload;
                delete userinfo.iat;
                delete userinfo.exp;

                const newAccessToken = jwt.sign(userinfo, ACCESS_SECRET_KEY, { expiresIn: accessTime });
                res.cookie('access', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24*60*60*1000,
                    domain: cookieDomain,
                })
                req.userinfo = userinfo as I_Users;
                handleNext();

            } else {
                req.userinfo = userinfo as I_Users;
                handleNext();
            }
        });
    } catch (e) {
        res.clearCookie('refresh', {
            httpOnly: true,
            secure: true,
            domain: cookieDomain,
        });
        res.clearCookie('access', {
            httpOnly: true,
            secure: true,
            domain: cookieDomain,
        });
        res.clearCookie('twitch', {
            httpOnly: true,
            secure: true,
            domain: cookieDomain,
        });
        res.json({
            status: false,
            href: `${process.env.APP_HOST}`,
        })
    }

    async function handleNext() {
        if (req.path.includes("/back")) { // 是否有權限進入後台
            if (!req.userinfo.isAdmin) {
                res.json({
                    status: true,
                    href: `${process.env.APP_HOST}/check`,
                })
            } else {
                res.json({
                    status: true,
                    message: "admin 登入成功",
                })
            }
            return;
        }
        if (req.path === "/") { // 是否從登入頁進入
            const redirectPage = req.userinfo.isAdmin ? 'back/check' : 'check';
            res.json({
                status: false,
                href: `${process.env.APP_HOST}/${redirectPage}`,
            })
            return;
        }
        if (adminRoutes.includes(req.path)) { // 是否是admin 專用的路徑
            const userModel = new Users(req.userinfo.id);
            const userinfo = await userModel.getUsers();

            // 抓取資料庫資料確認
            if (userinfo.status) {
                req.userinfo.isAdmin = userinfo.userinfo[0].isAdmin;
            } else {
                req.userinfo.isAdmin = false;
            }

            if (!req.userinfo.isAdmin) {
                res.json({
                    status: false,
                    href: `${process.env.APP_HOST}/check`,
                })
                return;
            }
        }
        if (frontPages.includes(req.path)) { // 每次進入前端頁面都要檢查
            res.json({
                status: true,
                message: `成功進入${req.path}`,
            });
            return;
        }
        next();
    }
};

export const uploadImage = (imageBuffer: Buffer, filename: string): string => {
    const imagePath = './Images';

    const targetFolder = path.join(__dirname, imagePath);
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    const filePath = path.join(targetFolder, filename);
    fs.writeFileSync(filePath, imageBuffer, {flag: 'w'});
    return filePath;
};

export const deleteImage = (removefile: string) => {
    const imagePath = './Images';

    const targetFolder = path.join(__dirname, imagePath);
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    const removefilePath = path.join(targetFolder, removefile);
    if(fs.existsSync(removefilePath)) {
        fs.unlinkSync(removefilePath);
    }
};

export const webSocketAuth = (ws: WebSocket, request: IncomingMessage) => {
    try {
        // cookie handle start
        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) throw new Error("cannot access cookies correctly");
        const cookies = cookie.parse(cookieHeader);

        const accessToken: string = cookies.access || "";
        const refreshToken: string = cookies.refresh || "";
        if (!accessToken || !refreshToken) throw new Error('cannot find refresh token or access token');
        // cookie handle end

        // verify jwt auth
        const userinfo = jwt.verify(accessToken, ACCESS_SECRET_KEY) as I_Users;
        if (!userinfo.isAdmin) {
            if (clientsQueue.size) throw new Error("websocket is being occupied");
            if (!userinfo.isGaming) throw new Error("no gaming request");
            clientsQueue.add(ws);
        }
        if (userinfo.isAdmin) adminQueue.add(ws);
        ws.send(JSON.stringify({
            type: E_WS_Type.MESSAGE,
            payload: "connected successfully",
        }));
        (ws as any).userinfo = userinfo;
        return userinfo;
    } catch (e) {
        ws.send(JSON.stringify({
            type: E_WS_Type.MESSAGE,
            payload: "fail to connect",
        }));
        ws.close();
        return null;
    }
};

export const websocketMessage = (ws: WebSocket) => {
    ws.on('message', (msg) => {
        for (const adminWS of adminQueue) {
            if (adminWS.readyState === WebSocket.OPEN) {
                adminWS.send(JSON.stringify({
                    type: E_WS_Type.ACTION,
                    payload: msg.toString(),
                }));
            }
        }
    })
};

export const websocketClose = (ws: WebSocket) => {
    ws.on('close', () => {
        clientsQueue.delete(ws);
        adminQueue.delete(ws); // admin 斷線也清除
    });
};

export const getNowTradeDate = () => {
  const now = new Date();

  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
};

export function broadcastAlert() {
    const jsonData = JSON.stringify(donate);
    alertClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonData);
        }
    });
};

export const initWebSockets = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, request) => {
        const url = request.url;

        if (url === "/socket/game") {
            console.log("有人連上 /socket/game");
            const userinfo = webSocketAuth(ws, request);
            if (!userinfo) return;

            websocketMessage(ws);
            websocketClose(ws);
        } else if (url === "/socket/alert") {
            console.log("有人連上 /socket/alert");
            alertClients.add(ws);
            ws.on("close", () => {
                alertClients.delete(ws);
            });
        } else {
            ws.close(1008, "Unknown path");
        }
    });
};

export const donate = {
    DonateNickName: "",
    DonateAmount: "",
    DonateMsg: "",
};

export function setDonate(donateValue: I_AlertMessage) {
    donate.DonateNickName = donateValue.DonateNickName;
    donate.DonateAmount = donateValue.DonateAmount;
    donate.DonateMsg = donateValue.DonateMsg;
};

export enum E_WS_Type {
    MESSAGE = "MESSAGE",
    ACTION = "ACTION",
};

export interface I_AlertMessage {
    DonateNickName: string;
    DonateAmount: string;
    DonateMsg: string;
};