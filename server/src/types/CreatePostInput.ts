import { Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Length(4)
  @Field()
  title: string;

  @Length(4)
  @Field()
  text: string;
}
