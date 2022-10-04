import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { resolvers } from './resolvers';
import { MyContext } from './types/context';
import { connectToDB } from './utils/connect';
import { logger } from './utils/logger';

const bootStrap = async () => {
  const RedisStore = connectRedis(session);

  const redisClient = new Redis({
    port: process.env.REDIS_PORT as unknown as number,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 10000,
  });

  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:3000', 'https://devfolio.ronit.pro'],
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: __prod__,
        sameSite: 'lax',
      },
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET as string,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers,
      validate: false,
    }),
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redisClient,
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.use(express.json());

  app.get('/', (_, res) => {
    res.send(JSON.stringify({ message: 'Hello World' }));
  });

  app.listen(4000, async () => {
    await connectToDB();
    logger.info('Server started on http://localhost:4000 🚀');
  });
};

bootStrap().catch((error) => {
  logger.error(error);
});
