require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "reddit",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: true,
    synchronize: true,
  });

  const app = express();

  app.listen(3000, () => {
    console.log("server start on port 3000");
  });
};

main().catch((err) => console.log(err));
