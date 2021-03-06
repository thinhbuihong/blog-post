import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post.entity";
import { User } from "./User.entity";

@Entity()
export class Upvote extends BaseEntity {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  postId!: number;

  @Column()
  value!: number;

  @ManyToOne(() => Post, (post) => post.upvotes)
  post!: Post;
  @ManyToOne(() => User, (user) => user.upvotes)
  user!: User;
}
