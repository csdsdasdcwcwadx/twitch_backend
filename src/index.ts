import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  const app = express();
  
  // 一般 API 範例
  app.get('/api/example', (req: Request, res: Response) => {
    res.json({ message: 'This is a REST API response' });
  });
  
  // 啟動 GraphQL Server 並與 Express 整合
  (async () => {
    await server.start();
  
    // 將 GraphQL 中介層加入 Express
    app.use('/graphql', bodyParser.json(), expressMiddleware(server));
  
    // 啟動伺服器
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  })();