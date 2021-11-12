module.exports = {
  ...(process.env.NODE_ENV === "dev"
    ? ({
      type: "postgres",
      database: "reddit",
      username: "postgres",
      password: "buihongthinh",
      logging: true,
      synchronize: true,
      entities: ["**/*.entity.ts"],
    })
    : {
      type: "postgres",
      url: process.env.DATABASE_URL,
      type: "postgres",
      logging: true,
      synchronize: false,
      entities: ["**/*.entity.js"],
    })
}
