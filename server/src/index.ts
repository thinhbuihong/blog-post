require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Context } from "./types/context";
import { PostResolver } from "./resolvers/post";
import cors from "cors";
import { Upvote } from "./entities/Upvote";
import { buildDataLoaders } from "./utils/dataLoaders";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "reddit",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: true,
    synchronize: true,
    entities: [User, Post, Upvote],
  });

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@cluster0.qbyfo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  await mongoose.connect(mongoUrl, {
    // useCreateIndex: true,
    // useUnifiedTopology: true,
    // useNewUrlParser: true,
    // useFindAndModify: false,
  });

  app.use(
    session({
      store: MongoStore.create({ mongoUrl }),
      secret: process.env.SESSION_SECRET_DEV_PROD || "",
      name: COOKIE_NAME, //name of cookie is saved in browser
      saveUninitialized: false, //dont save empty sessions, right from the start
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true, //client cant access the cookie
        secure: __prod__,
        sameSite: "lax", //protection against CSRF
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({
      req,
      res,
      connection,
      dataLoaders: buildDataLoaders(),
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `server start on port ${PORT}, \nGraphql: http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  });
};

main().catch((err) => console.log(err));
