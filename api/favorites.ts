import Favorite from "@/types/Favorite";
import instance from ".";

const addFavorite = async (recipeID: string): Promise<Favorite> => {
  const { data } = await instance.post("/favorites", { recipeID });
  return data;
};

const getMyFavorites = async (): Promise<Favorite[]> => {
  const { data } = await instance.get("/favorites");
  return data;
};

const removeFavorite = async (recipeID: string): Promise<void> => {
  await instance.delete(`/favorites/${recipeID}`);
};

const checkFavorite = async (
  recipeID: string
): Promise<{ isFavorited: boolean }> => {
  const { data } = await instance.get(`/favorites/check/${recipeID}`);
  return data;
};

export { addFavorite, checkFavorite, getMyFavorites, removeFavorite };
