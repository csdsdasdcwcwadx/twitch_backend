import { Request, Response } from 'express';
import axios from 'axios';
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, accessTime, refreshTime, cookieDomain, domainEnv } from '../util';
import jwt from 'jsonwebtoken';
import { Users } from '../Models/user';

const login = async (req: Request, res: Response) => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const redirectUri = `${domainEnv}:4000/login`;
  
    const { code } = req.query;
    if (!code) {
      return res.status(500).send("登入失敗");
    }
  
    try {
        const tokenResponse = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            },
        });
    
        const twitchAccessToken = tokenResponse.data.access_token;
        
        // 2. 使用 Access Token 獲取 Twitch 使用者資料
        const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Authorization": `Bearer ${twitchAccessToken}`,
                "Client-Id": clientId,
            },
        });
    
        const userData = userResponse.data.data[0]; // 取得第一筆使用者資料

        const profile_image = userData.profile_image_url.split('https://static-cdn.jtvnw.net')[1];
        const user = new Users(undefined, userData.id, userData.login, userData.display_name, userData.email, profile_image);
        const result = await user.registry();

        if (result.status) {
            const accessToken = jwt.sign(result.userinfo[0], ACCESS_SECRET_KEY, {expiresIn: accessTime});
            const refreshToken = jwt.sign(result.userinfo[0], REFRESH_SECRET_KEY, {expiresIn: refreshTime});
    
            res.cookie('access', accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 24*60*60*1000,
                domain: cookieDomain,
            })
            res.cookie('refresh', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 24*60*60*1000,
                domain: cookieDomain,
            })
            if (result.userinfo[0].isAdmin) {
                res.redirect(`${domainEnv}:3000/back`);
            } else {
                res.redirect(`${domainEnv}:3000/check?id=${result.userinfo[0].id}`);
            }
        }

    } catch (e) {
        res.status(500).send("登入失敗");
    }
}

export {
    login,
}