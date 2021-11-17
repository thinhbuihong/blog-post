import { IsString, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  @Length(4)
  @IsString()
  usernameOrEmail: string;

  @Length(4)
  @Field()
  password: string;
}
