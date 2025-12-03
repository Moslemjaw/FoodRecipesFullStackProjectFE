import Follow from "@/types/Follow";
import instance from ".";

const followUser = async (userID: string): Promise<Follow> => {
  const { data } = await instance.post(`/follow/${userID}`);
  return data;
};

const unfollowUser = async (userID: string): Promise<void> => {
  await instance.delete(`/follow/${userID}`);
};

const getFollowing = async (): Promise<Follow[]> => {
  const { data } = await instance.get("/follow/following");
  return data;
};

const getFollowers = async (): Promise<Follow[]> => {
  const { data } = await instance.get("/follow/followers");
  return data;
};

export { followUser, getFollowers, getFollowing, unfollowUser };
