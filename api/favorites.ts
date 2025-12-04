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
  console.log("removeFavorite API function called with recipeID:", recipeID);
  console.log("Making DELETE request to:", `/favorites/${recipeID}`);
  try {
    const response = await instance.delete(`/favorites/${recipeID}`);
    console.log("DELETE request successful, response:", response);
    return;
  } catch (error: any) {
    console.error("DELETE request failed:", error);
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
};

const checkFavorite = async (
  recipeID: string
): Promise<{ isFavorited: boolean }> => {
  // Backend.md doesn't have a /favorites/check endpoint
  // So we fetch all favorites and check if recipeID exists
  try {
    const { data } = await instance.get("/favorites");
    const isFavorited = data.some((fav: Favorite) => {
      // Handle populated recipe object (Backend.md says recipeID is populated in GET)
      const favRecipeId =
        typeof fav.recipeID === "object" && fav.recipeID
          ? (fav.recipeID as any)._id
          : fav.recipeID;
      return favRecipeId === recipeID;
    });
    return { isFavorited };
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return { isFavorited: false };
  }
};

export { addFavorite, checkFavorite, getMyFavorites, removeFavorite };
