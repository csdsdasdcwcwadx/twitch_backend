import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
  
const app = express();
  
// 一般 API 範例
app.get('/login', async (req: Request, res: Response) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redirectUri = "http://localhost:4000/login";

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
  
    const accessToken = tokenResponse.data.access_token;
  
    // 2. 使用 Access Token 獲取 Twitch 使用者資料
    const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
    });
  
    const userData = userResponse.data.data[0]; // 取得第一筆使用者資料
    res.redirect('http://localhost:3000/check');
    // res.status(200).send(userData);
  } catch (e) {
    console.log(e)
    res.status(500).send("登入失敗");
  }
});
  
// 啟動 GraphQL Server 並與 Express 整合
(async () => {
  await server.start();

  // 將 GraphQL 中介層加入 Express
  app.use('/graphql', bodyParser.json(), expressMiddleware(server));

  // 啟動伺服器
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
})();