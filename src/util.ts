import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mysql, { PoolConfig } from 'mysql';

export const ACCESS_SECRET_KEY = uuidv4();
export const REFRESH_SECRET_KEY = uuidv4();

export const accessTime = '15m';
export const refreshTime = '10h';

export const domainEnv = process.env.ENV === 'prod' ? '' : 'http://localhost';
export const cookieDomain = process.env.ENV === 'prod' ? '' : '';
 
export const authMiddleWare = async (req: Request, res: Response, next: Function) => {
    const accessToken: string = req.cookies.access;
    const refreshToken: string = req.cookies.refresh;

    if (req.path === '/login') {
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
                handleNext(userinfo);

            } else handleNext(userinfo);
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
        res.redirect(`${domainEnv}:3000`);
    }

    function handleNext(userinfo: any) {
        if (req.path === "/") {
            res.json({
                status: true,
                href: `${domainEnv}:3000/check?${userinfo.id}`,
            })
        } else next();
    }
}

export const initializeDatabase = (connection: mysql.PoolConnection) => {
    const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(12) PRIMARY KEY,
            twitch_id VARCHAR(20) NOT NULL,
            login VARCHAR(20) NOT NULL,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            profile_image VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Items (
            id VARCHAR(12) PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            image VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Checks (
            id VARCHAR(12) PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserChecks (
            user_id VARCHAR(12),
            check_id VARCHAR(12),
            checked TINYINT(1) DEFAULT 1,
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
    `

    connection.query(createUserTableQuery, (err) => {
        if (err) {
            console.error('Failed to create Users table:', err);
            throw err;
        } else {
            console.log('Users table is ready.');
        }
        connection.release(); // 釋放連接
    });
};