import Follow from "@/types/Follow";
import instance from ".";

const followUser = async (userID: string): Promise<Follow> => {
  const { data } = await instance.post(`/follows/${userID}`);
  return data;
};

const unfollowUser = async (userID: string): Promise<void> => {
  await instance.delete(`/follows/${userID}`);
};

const getFollowing = async (): Promise<Follow[]> => {
  const { data } = await instance.get("/follows/following");
  return data;
};

const getFollowers = async (): Promise<Follow[]> => {
  const { data } = await instance.get("/follows/followers");
  return data;
};

export { followUser, getFollowers, getFollowing, unfollowUser };
