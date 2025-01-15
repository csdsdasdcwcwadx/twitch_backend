import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import memberRoutes from './Routers/user';
import checkRoutes from './Routers/check';

import { authMiddleWare, initializeDatabase } from "./util";
import cookieParser from 'cookie-parser';
import db from "./migration";

dotenv.config();

db.getConnection((err, connection) => {
  if (err) {
      console.error('Database connection failed:', err);
      throw err;
  } else {
      console.log('Connected to MySQL server.');
      initializeDatabase(connection); // 初始化資料庫
  }
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
  
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authMiddleWare);

// 一般 API
app.use('/twitch/member', memberRoutes);
app.use('/twitch/check', checkRoutes);

// 啟動 GraphQL Server 並與 Express 整合
(async () => {
  await apolloServer.start();

  // 將 GraphQL 中介層加入 Express
  app.use('/graphql', expressMiddleware(apolloServer));

  // 啟動伺服器
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
})();