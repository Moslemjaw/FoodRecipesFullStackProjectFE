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
  const favorites = await getMyFavorites();
  const isFavorited = favorites.some((fav: any) => {
    const favRecipeId = fav.recipeID?._id || fav.recipeID;
    return favRecipeId === recipeID;
  });
  return { isFavorited };
};

export { addFavorite, checkFavorite, getMyFavorites, removeFavorite };
