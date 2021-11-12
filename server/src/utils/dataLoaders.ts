import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote.entity";
import { User } from "../entities/User.entity";

interface VoteTypeCondition {
  postId: number;
  userId: number;
}

const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds);
  return userIds.map((userId) => users.find((u) => u.id === userId));
};

const batchGetVoteTypes = async (voteTypeCondition: VoteTypeCondition[]) => {
  const voteTypes = await Upvote.findByIds(voteTypeCondition);
  return voteTypeCondition.map((vtc) =>
    voteTypes.find((vt) => vt.postId === vtc.postId && vt.userId === vtc.userId)
  );
};

export const buildDataLoaders = () => {
  return {
    //number va user tu chuyen sang kieu array
    userLoader: new DataLoader<number, User | undefined>((userIds) =>
      batchGetUsers(userIds as number[])
    ),
    voteTypeLoader: new DataLoader<VoteTypeCondition, Upvote | undefined>(
      (voteTypeConditions) =>
        batchGetVoteTypes(voteTypeConditions as VoteTypeCondition[])
    ),
  };
};
