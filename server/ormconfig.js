module.exports = {
  ...(process.env.NODE_ENV === "dev"
    ? ({
      database: "reddit",
      username: "postgres",
      password: "buihongthinh",
      synchronize: false,
      entities: ["**/*.entity.ts"],
    })
    : {
      url: process.env.DATABASE_URL,
      synchronize: false,
      entities: ["**/*.entity.js"],
      extra: {
        ssl: {
          rejectUnauthorized: false
        }
      },
      ssl: true
    })
  ,
  logging: true,
  username: "postgres",
  type: "postgres",
  migrations: ["./dist/migration/*.js"],
  "cli": {
    "migrationsDir": "migration"
  },
}
