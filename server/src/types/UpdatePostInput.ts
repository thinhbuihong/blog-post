import { Length } from "class-validator";
import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UpdatePostInput {
  @Field((_type) => ID)
  id: number;

  @Field()
  @Length(4)
  title: string;

  @Field()
  @Length(4)
  text: string;
}
