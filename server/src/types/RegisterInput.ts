import { IsEmail, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  @Length(4, 99)
  username: string;

  @Field()
  @IsEmail()
  @Length(4, 99)
  email: string;

  @Length(4, 99)
  @Field()
  password: string;
}
