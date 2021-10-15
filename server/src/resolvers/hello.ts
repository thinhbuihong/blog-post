import { Context } from "../types/context";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query((_returns) => String)
  hello(@Ctx() { req }: Context) {
    console.log("userId: ", req.session.userId);
    return "hello world";
  }
}
