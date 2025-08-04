import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import memberRoutes from './Routers/user';
import checkRoutes from './Routers/check';
import itemRoutes from './Routers/item';
import userCheckRoutes from './Routers/userCheck';
import userItemRoutes from './Routers/userItems';
import redempRoutes from './Routers/redemption';

import { authMiddleWare, clientsQueue, webSocketAuth, adminQueue, E_WS_Type, websocketMessage, websocketClose } from "./util";
import { I_Users } from "./Models/user";
import { initializeDataBase } from './migration';


const opay_payment = require("../../Payment_Node.js-master/opay_payment_nodejs/lib/opay_payment.js");
const opay = new opay_payment();

declare global {
  namespace Express {
    interface Request {
      userinfo: I_Users;
    }
  }
}

dotenv.config();
initializeDataBase();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();
const server = createServer(app); // 用 http 包 Express
const wss = new WebSocketServer({ server }); // 啟動 WebSocket Server

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authMiddleWare);

wss.on('connection', (ws, request) => {
   const userinfo = webSocketAuth(ws, request);
   if (!userinfo) return;

  websocketMessage(ws);
  websocketClose(ws);
});

app.post("/payment/testing", (req: Request, res: Response) => {
  const data = req.body;
  console.log("收到歐付寶通知：", data);
  res.send("result");
});

app.get('/payment', (req: Request, res: Response) => {
  const base_param = {
    MerchantTradeNo: 'f0a0d7e9fae1bb72b555', //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
    MerchantTradeDate: '2017/02/13 15:45:30', //ex: 2017/02/13 15:45:30
    TotalAmount: '100',
    TradeDesc: '測試交易描述',
    ItemName: '測試商品等',
    ReturnURL: 'http://127.0.0.1:4000/payment/testing',
    OrderResultURL: 'http://127.0.0.1:4000/payment/testing',
  };
  const ans = opay.payment_client.aio_check_out_credit_onetime(base_param);
  res.send(ans);
});

// 圖片路徑
app.use('/item/images', express.static(path.join(__dirname, 'Images')));

// 一般 API
app.use('/member', memberRoutes);
app.use('/check', checkRoutes);
app.use('/item', itemRoutes);
app.use('/usercheck', userCheckRoutes);
app.use('/useritem', userItemRoutes);
app.use('/redemp', redempRoutes);

// 啟動 GraphQL Server 並與 Express 整合
(async () => {
  await apolloServer.start();

  // 將 GraphQL 中介層加入 Express
  app.use('/graphql', expressMiddleware(apolloServer, {
    context: async ({ req, res }) => ({
      token: req.userinfo,
    }),
  }));

  app.use('*', (req, res) => {
    res.redirect(`${process.env.APP_HOST}`);
  });

  // 啟動伺服器
  const PORT = parseInt(process.env.PORT || '4000');
  server.listen(PORT,() => {
    console.log(`Server started on port: ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
})();