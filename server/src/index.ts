require("dotenv").config();
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import MongoStore from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { Context } from "./types/context";
import { buildDataLoaders } from "./utils/dataLoaders";

const main = async () => {
  process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
  console.clear();
  const connection = await createConnection();
  //   {
  //   type: "postgres",
  //   database: "reddit",
  //   username: process.env.DB_USERNAME_DEV,
  //   password: process.env.DB_PASSWORD_DEV,
  //   logging: true,
  //   synchronize: true,
  //   entities: ["**/*.entity.ts"],
  // }

  const app = express();
  app.use(
    cors({
      origin: process.env.CORS_CLIENT || "http://localhost:3000",
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

  app.set("trust proxy", 1);
  app.use(
    session({
      store: MongoStore.create({ mongoUrl }),
      secret: process.env.SESSION_SECRET_DEV_PROD || "asd",
      name: COOKIE_NAME, //name of cookie is saved in browser
      saveUninitialized: false, //dont save empty sessions, right from the start
      resave: false, //true se tu dong luu lai session trong session store ngay ca khi session ko doi #sc
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true, //client cant access the cookie
        secure: __prod__,
        sameSite: __prod__ ? "none" : undefined, //protection against CSRF
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: true,
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
  console.log("=".repeat(200));
};

main().catch((err) => console.log(err));
