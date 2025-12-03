import User from "./User";

interface Follow {
  _id: string;
  followerID: User | string;
  followingID: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export default Follow;
