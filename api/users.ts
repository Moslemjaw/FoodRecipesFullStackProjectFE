import User from "@/types/User";
import instance from ".";

const getUserById = async (userId: string): Promise<User> => {
  const { data } = await instance.get(`/users/${userId}`);
  return data;
};

const getUserRecipes = async (userId: string): Promise<any[]> => {
  // Get all recipes and filter by userId
  const { data } = await instance.get("/recipes");
  return data.filter((recipe: any) => {
    const recipeUserId =
      typeof recipe.userId === "object" ? recipe.userId._id : recipe.userId;
    return recipeUserId === userId;
  });
};

const getAllUsers = async (): Promise<User[]> => {
  const { data } = await instance.get("/users");
  return data;
};

export { getUserById, getUserRecipes, getAllUsers };

