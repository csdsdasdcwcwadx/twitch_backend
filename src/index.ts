import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

import memberRoutes from './Routers/user';
import checkRoutes from './Routers/check';
import itemRoutes from './Routers/item';
import userCheckRoutes from './Routers/userCheck';
import userItemRoutes from './Routers/userItems';
import redempRoutes from './Routers/redemption';

import { authMiddleWare } from "./util";
import { I_Users } from "./Models/user";
import { initializeDataBase } from './migration';

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authMiddleWare);

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
  app.listen(PORT,() => {
    console.log(`Server started on port: ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
})();