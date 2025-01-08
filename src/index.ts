import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import memberRoutes from './Routers/member';
import { authMiddleWare } from "./util";
import cookieParser from 'cookie-parser';
dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
  
const app = express();

app.use(cookieParser())
app.use(authMiddleWare);
  
// 一般 API 範例
app.use(memberRoutes);

app.get('/cat', (req, res) => {
  res.send('cat')
});

app.get('/', (req, res) => {
  res.send('dog')
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