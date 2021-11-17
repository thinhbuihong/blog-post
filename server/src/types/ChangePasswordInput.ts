import { Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class ChangePasswordInput {
  @Field()
  @Length(4)
  newPassword: string;
}
