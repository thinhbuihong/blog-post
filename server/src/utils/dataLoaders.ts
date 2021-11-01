import DataLoader from "dataloader";
import { User } from "../entities/User";

const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds);
  return userIds.map((userId) => users.find((u) => u.id === userId));
};

export const buildDataLoaders = () => {
  return {
    userLoader: new DataLoader<number, User | undefined>((userIds) =>
      batchGetUsers(userIds as number[])
    ),
  };
};
