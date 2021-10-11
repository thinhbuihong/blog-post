import { hash } from "argon2";
import { UserMutationReponse } from "../types/UserMutationResponse";
import { Arg, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
  @Mutation((_returns) => UserMutationReponse, { nullable: true })
  async register(
    @Arg("email") email: string,
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<UserMutationReponse> {
    try {
      const exitingUser = await User.findOne({
        where: [{ username }, { email }],
      });
      if (exitingUser) {
        return {
          code: 400,
          success: false,
          message: "username already existed",
          error: [
            {
              field: exitingUser.username === username ? "username" : "email",
              message: "username or email already taken",
            },
          ],
        };
      }

      const hashedPassword = await hash(password);

      const newUser = User.create({
        username,
        password: hashedPassword,
        email,
      });

      return {
        code: 200,
        success: true,
        message: "user registration successful",
        user: await User.save(newUser),
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `internal server error ${error.message}`,
      };
    }
  }
}
