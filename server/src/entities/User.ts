import { Expose } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Upvote } from "./Upvote";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  @Expose()
  @Length(4, 99, { groups: ["register"] })
  @IsString()
  username!: string;

  @Field()
  @Column({ unique: true })
  @Expose()
  @IsEmail(undefined, { groups: ["register"] })
  email!: string;

  @Column()
  @Expose()
  @Length(4)
  @IsString()
  password!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field((_type) => [Post])
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];
}
