import Category from "./Category";
import Ingredient from "./Ingredient";
import User from "./User";

interface RecipeIngredient {
  ingredientId: Ingredient | string;
  quantity: number;
  unit: string;
  _id?: string;
}

interface Recipe {
  _id: string;
  title: string;
  instructions: string;
  image?: string;
  cookingTime?: number;
  userId: User | string;
  categoryId?: Category | string;
  ingredients: RecipeIngredient[];
  createdAt?: string;
  updatedAt?: string;
}

export default Recipe;
export type { RecipeIngredient };
