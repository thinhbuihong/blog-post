import { UserInputError } from "apollo-server-errors";
import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Int,
  Root,
  UseMiddleware,
  Ctx,
  registerEnumType,
} from "type-graphql";
import { FindManyOptions, LessThan } from "typeorm";
import { Post } from "../entities/Post";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";
import { checkAuth } from "../middleware/checkAuth";
import { Context } from "../types/context";
import { CreatePostInput } from "../types/CreatePostInput";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { UpdatePostInput } from "../types/UpdatePostInput";
import { VoteType } from "../types/VoteType";

registerEnumType(VoteType, {
  name: "VoteType",
});

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_return) => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver((_return) => User)
  async user(
    @Root() root: Post,
    //dataloader
    @Ctx() { dataLoaders: { userLoader } }: Context
  ) {
    // return await User.findOne(root.userId);
    return await userLoader.load(root.userId);
  }

  @FieldResolver((_return) => Int)
  async voteType(@Root() root: Post, @Ctx() { req, dataLoaders }: Context) {
    if (!req.session.userId) return 0;

    // const existingVote = await Upvote.findOne({
    //   postId: root.id,
    //   userId: req.session.userId,
    // });

    const existingVote = await dataLoaders.voteTypeLoader.load({
      postId: root.id,
      userId: req.session.userId,
    });

    return existingVote ? existingVote.value : 0;
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
        userId: req.session.userId,
      });

      await newPost.save();
      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: newPost,
      };
    } catch (error) {
      console.log(error.message);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Query((_return) => PaginatedPosts, { nullable: true })
  async posts(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPostsCount = await Post.count();
      const realLimit = Math.min(10, limit);

      const findOptions: FindManyOptions<Post> = {
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
      };

      let lastPost: Post[] = [];
      if (cursor) {
        findOptions.where = { createdAt: LessThan(cursor) };

        lastPost = await Post.find({ order: { createdAt: "ASC" }, take: 1 });
      }

      const posts = await Post.find(findOptions);

      return {
        cursor: posts[posts.length - 1].createdAt,
        totalCount: totalPostsCount,
        hasMore: cursor
          ? posts[posts.length - 1].createdAt.toString() !==
            lastPost[0].createdAt.toString()
          : posts.length !== totalPostsCount,
        paginatedPosts: posts,
      };
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | undefined> {
    try {
      const post = await Post.findOne(id);
      return post;
    } catch (error) {
      console.log(error.message);
      return undefined;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { id, text, title }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne(id);
    if (!existingPost) {
      return {
        code: 400,
        success: false,
        message: "Post not found",
      };
    }
    if (existingPost.userId !== req.session.userId) {
      return { code: 401, success: false, message: "Unauthorised" };
    }
    // existingPost.title = post.title;
    // existingPost.text = post.text;
    Object.assign(existingPost, { text, title });

    await Post.save(existingPost);

    return {
      code: 200,
      success: true,
      message: "post updated successfully",
      post: existingPost,
    };
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", (_type) => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne(id);
    if (!existingPost) {
      return {
        code: 400,
        success: false,
        message: "Post not found",
      };
    }
    if (existingPost.userId !== req.session.userId) {
      return { code: 401, success: false, message: "Unauthorised" };
    }

    await Upvote.delete({ postId: id });
    await Post.delete({ id });
    return {
      code: 200,
      success: true,
      message: "post deleted successfully",
    };
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg("postId", (_type) => Int) postId: number,
    @Arg("inputVoteValue", (_type) => VoteType) inputVoteValue: VoteType,
    @Ctx() { connection, req }: Context
  ): Promise<PostMutationResponse> {
    return await connection.transaction(async (transactionEtityManager) => {
      let post = await transactionEtityManager.findOne(Post, postId);
      if (!post) {
        throw new UserInputError("Post not found");
      }

      //check if user has voted or not
      const existingVote = await transactionEtityManager.findOne(Upvote, {
        postId,
        userId: req.session.userId,
      });
      if (existingVote && existingVote.value != inputVoteValue) {
        await transactionEtityManager.save(Upvote, {
          ...existingVote,
          value: inputVoteValue,
        });

        post = await transactionEtityManager.save(Post, {
          ...post,
          points: post.points + inputVoteValue * 2,
        });
      }

      if (!existingVote) {
        const newVote = transactionEtityManager.create(Upvote, {
          userId: req.session.userId,
          postId,
          value: inputVoteValue,
        });
        await transactionEtityManager.save(newVote);

        post.points = post.points + inputVoteValue;
        post = await transactionEtityManager.save(post);
      }

      //chua check userid
      return {
        code: 200,
        success: true,
        message: "post voted",
        post,
      };
    });
  }
}
