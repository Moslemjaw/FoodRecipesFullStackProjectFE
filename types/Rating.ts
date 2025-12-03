import Recipe from "./Recipe";
import User from "./User";

interface Rating {
  _id: string;
  userID: User | string;
  recipeID: Recipe | string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export default Rating;
