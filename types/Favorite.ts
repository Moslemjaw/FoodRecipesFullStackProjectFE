import Recipe from "./Recipe";
import User from "./User";

interface Favorite {
  _id: string;
  userID: User | string;
  recipeID: Recipe | string;
  createdAt?: string;
  updatedAt?: string;
}

export default Favorite;
