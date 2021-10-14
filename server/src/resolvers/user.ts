import { hash, verify } from "argon2";
import { UserMutationReponse } from "../types/UserMutationResponse";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/context";

@Resolver()
export class UserResolver {
  @Mutation((_returns) => UserMutationReponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput
  ): // @Arg("email") email: string,
  // @Arg("username") username: string,
  // @Arg("password") password: string
  Promise<UserMutationReponse> {
    const validateRegisterInputErrors = validateRegisterInput(registerInput);
    if (validateRegisterInputErrors) {
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      };
    }

    try {
      const { username, password, email } = registerInput;
      const exitingUser = await User.findOne({
        where: [{ username }, { email }],
      });
      if (exitingUser) {
        return {
          code: 400,
          success: false,
          message: "username already existed",
          errors: [
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

  @Mutation((_return) => UserMutationReponse)
  async login(
    @Arg("loginInput") { password, usernameOrEmail }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationReponse> {
    try {
      const existingUser = await User.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );

      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: "user not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: "username or email incorrect",
            },
          ],
        };
      }

      const passwordValid = await verify(existingUser.password, password);
      if (!passwordValid) {
        return {
          code: 400,
          success: false,
          message: "wrong password",
          errors: [{ field: "password", message: "incorrect password" }],
        };
      }

      //create session and return cookie
      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        message: "logged in successfully",
        user: existingUser,
      };
    } catch (error) {
      console.log(error.message);
      return {
        code: 500,
        success: false,
        message: `internal server error ${error.message}`,
      };
    }
  }
}
