import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PoolConnection } from 'mysql2';
import { I_Users } from './Models/user';

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

    function handleNext() {
        if (req.path.includes("/back")) {
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
        if (req.path === "/") {
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
        if (adminRoutes.includes(req.path)) {
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
        if (frontPages.includes(req.path)) {
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

export const initializeDatabase = (connection: PoolConnection) => {
    const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(12) PRIMARY KEY,
            twitch_id VARCHAR(20) NOT NULL,
            login VARCHAR(20) NOT NULL,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            profile_image VARCHAR(100),
            isAdmin TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Items (
            id VARCHAR(12) PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            image VARCHAR(100),
            description VARCHAR(100),
            type VARCHAR(20),
            amount INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Checks (
            id VARCHAR(12) PRIMARY KEY,
            passcode VARCHAR(30),
            streaming TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserChecks (
            user_id VARCHAR(12),
            check_id VARCHAR(12),
            checked TINYINT(1) DEFAULT 0,
            PRIMARY KEY (user_id, check_id),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (check_id) REFERENCES Checks(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserItems (
            user_id VARCHAR(12),
            item_id VARCHAR(12),
            amount INT,
            PRIMARY KEY (user_id, item_id),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Redemptions (
            id VARCHAR(12) PRIMARY KEY,
            user_id VARCHAR(12) NOT NULL,
            item_id VARCHAR(12) NOT NULL,
            amount INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE
        );
    `

    connection.query(createUserTableQuery, (err) => {
        if (err) {
            console.error('Failed to create Users table:', err);
            throw err;
        } else {
            console.log('tables are ready.');
        }
        connection.release(); // 釋放連接
    });
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
}