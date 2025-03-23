import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PoolConnection } from 'mysql2';
import { I_Users, Users } from './Models/user';
import db from './migration';

export const ACCESS_SECRET_KEY = uuidv4();
export const REFRESH_SECRET_KEY = uuidv4();

export const accessTime = '15m';
export const refreshTime = '10h';

export const domainEnv = process.env.ENV === 'prod' ? '' : 'http://localhost';
export const cookieDomain = process.env.ENV === 'prod' ? '' : '';

export const adminRoutes = [
    // check
    '/twitch/check/addcheck',
    '/twitch/check/updatecheckstatus',
    // item
    '/twitch/item/additem',
    '/twitch/item/deleteitem',
    // useritem
    '/twitch/useritem/ownitem',
    // redemption
    '/twitch/redemp/update',
];

export const frontPages = ['/check', '/game', '/pack', '/exchange'];
 
export const authMiddleWare = async (req: Request, res: Response, next: Function) => {
    const accessToken: string = req.cookies.access;
    const refreshToken: string = req.cookies.refresh;

    if (req.path === '/twitch/member/login') {
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
        if (process.env.ENV === "prod") res.redirect(`${domainEnv}:3000`);
        else {
            res.json({
                status: false,
                href: `${domainEnv}:3000`,
            })
        }
    }

    async function handleNext() {
        if (req.path.includes("/back")) { // 是否有權限進入後台
            if (!req.userinfo.isAdmin) {
                if (process.env.ENV === "prod") {
                    res.redirect(`${domainEnv}:3000/check`);
                } else {
                    res.json({
                        status: true,
                        href: `${domainEnv}:3000/check`,
                    })
                }
            } else {
                if (process.env.ENV !== "prod") {
                    res.json({
                        status: true,
                        message: "admin 登入成功",
                    })
                }
            }
            return;
        }
        if (req.path === "/") { // 是否從登入頁進入
            const redirectPage = req.userinfo.isAdmin ? 'back/check' : 'check';
            if (process.env.ENV === "prod") {
                res.redirect(`${domainEnv}:3000/${redirectPage}`);
            } else {
                res.json({
                    status: false,
                    href: `${domainEnv}:3000/${redirectPage}`,
                })
            }
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
                if (process.env.ENV === "prod") {
                    res.redirect(`${domainEnv}:3000/check`);
                } else {
                    res.json({
                        status: false,
                        href: `${domainEnv}:3000/check`,
                    })
                }
                return;
            }
        }
        if (frontPages.includes(req.path)) { // 每次進入前端頁面都要檢查
            if (process.env.ENV !== "prod") {
                res.json({
                    status: true,
                    message: "成功進入此頁",
                });
                return;
            }
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