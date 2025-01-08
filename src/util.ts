import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const ACCESS_SECRET_KEY = uuidv4();
export const REFRESH_SECRET_KEY = uuidv4();

export const accessTime = '15m';
export const refreshTime = '10h';

export const domainEnv = process.env.ENV === 'prod' ? '' : '';
 
export const authMiddleWare = async (req: Request, res: Response, next: Function) => {
    const accessToken: string = req.cookies.access;
    const refreshToken: string = req.cookies.refresh;

    if (req.path === '/login') {
        next();
        return;
    }

    try {
        if (!accessToken || !refreshToken) throw new Error('cannot find refresh token or access token');
        jwt.verify(accessToken, ACCESS_SECRET_KEY, (err, _) => {
            if (err) {
                const userinfo = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as JwtPayload;
                delete userinfo.iat;
                delete userinfo.exp;

                const newAccessToken = jwt.sign(userinfo, ACCESS_SECRET_KEY, { expiresIn: accessTime });
                res.cookie('access', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24*60*60*1000,
                    domain: domainEnv,
                })
                next();

            } else next();
        });
    } catch (e) {
        res.clearCookie('refresh', {
            httpOnly: true,
            secure: true,
            domain: domainEnv,
        });
        res.clearCookie('access', {
            httpOnly: true,
            secure: true,
            domain: domainEnv,
        });
        res.redirect('http://localhost:3000');
    }
}