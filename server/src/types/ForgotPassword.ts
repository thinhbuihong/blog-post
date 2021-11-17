import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  email: string;
}
