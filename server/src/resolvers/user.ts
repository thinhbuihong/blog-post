import { hash, verify } from "argon2";
import { COOKIE_NAME } from "../constants";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { User } from "../entities/User";
import { Context } from "../types/context";
import { LoginInput } from "../types/LoginInput";
import { RegisterInput } from "../types/RegisterInput";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { ForgotPasswordInput } from "../types/ForgotPassword";
import { sendEmail } from "../utls/sendEmail";
import { TokenModel } from "../models/Token";
import { v4 } from "uuid";
import { ChangePasswordInput } from "../types/ChangePasswordInput";
import { Post } from "../entities/Post";

@Resolver((_of) => User)
export class UserResolver {
  @FieldResolver((_return) => [Post])
  async posts(@Root() root: User) {
    return await Post.find({ userId: root.id });
  }

  @FieldResolver((_return) => String)
  email(@Root() root: User, @Ctx() { req }: Context) {
    if (req.session.userId === root.id) {
      return root.email;
    }
    return "";
  }

  @Query((_return) => User, { nullable: true })
  async currentUser(@Ctx() { req }: Context): Promise<User | undefined | null> {
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne(req.session.userId);
    return user;
  }

  @Mutation((_returns) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): // @Arg("email") email: string,
  // @Arg("username") username: string,
  // @Arg("password") password: string
  Promise<UserMutationResponse> {
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

      const user = await User.save(newUser);
      req.session.userId = user.id;
      return {
        code: 200,
        success: true,
        message: "user registration successful",
        user,
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

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { password, usernameOrEmail }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
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

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log("destroying session error", error.message);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  @Mutation((_return) => Boolean)
  async forgotPassword(
    @Arg("forgotPasswordInput") forgotPasswordInput: ForgotPasswordInput
  ): Promise<boolean> {
    const user = await User.findOne({ email: forgotPasswordInput.email });

    if (!user) {
      return true;
    }

    await TokenModel.findOneAndDelete({ userId: user.id + "" });

    const resetToken = v4();
    const hashedResetToken = await hash(resetToken);

    await new TokenModel({
      userId: user.id + "",
      token: hashedResetToken,
    }).save();

    await sendEmail(
      forgotPasswordInput.email,
      `<a href="http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}">click here to reset your password</a>`
    );

    return true;
  }

  @Mutation((_return) => UserMutationResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("userId") userId: string,
    @Arg("changePasswordInput") changePasswordInut: ChangePasswordInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    if (changePasswordInut.newPassword.length <= 4) {
      return {
        code: 400,
        success: false,
        message: "invalid password",
        errors: [
          { field: "newPassword", message: "length must be greater than 4" },
        ],
      };
    }

    try {
      const resetPasswordTokenRecord = await TokenModel.findOne({ userId });
      if (!resetPasswordTokenRecord) {
        return {
          code: 400,
          success: false,
          message: "invalid or expired password reset token",
          errors: [
            {
              field: "token",
              message: "invalid or expired password reset token",
            },
          ],
        };
      }

      const resetPasswordTokenValid = verify(
        resetPasswordTokenRecord.token,
        token
      );
      if (!resetPasswordTokenValid) {
        return {
          code: 400,
          success: false,
          message: "invalid or expired password reset token",
          errors: [
            {
              field: "token",
              message: "invalid or expired password reset token",
            },
          ],
        };
      }

      const user = await User.findOne(parseInt(userId));
      if (!user) {
        return {
          code: 400,
          success: false,
          message: "user no longer exists",
          errors: [{ field: "token", message: "user no longer exists" }],
        };
      }

      const updatedPassword = await hash(changePasswordInut.newPassword);
      await User.update({ id: +userId }, { password: updatedPassword });

      await resetPasswordTokenRecord.deleteOne();

      req.session.userId = user.id;
      return {
        code: 200,
        success: true,
        message: "userpassword reset successfully",
        user,
      };
    } catch (error) {
      console.log(error.message);
      return {
        code: 500,
        success: false,
        message: `internal server error ${error.message}`,
        errors: [
          { field: "token", message: `internal server error ${error.message}` },
        ],
      };
    }
  }
}
