import Rating from "@/types/Rating";
import instance from ".";

interface RatingResponse {
  ratings: Rating[];
  totalRatings: number;
  averageRating: number;
}

const addRating = async (recipeID: string, rating: number): Promise<Rating> => {
  const { data } = await instance.post("/ratings", { recipeID, rating });
  return data;
};

const getRecipeRatings = async (recipeId: string): Promise<RatingResponse> => {
  const { data } = await instance.get(`/ratings/recipe/${recipeId}`);
  return data;
};

const updateRating = async (id: string, rating: number): Promise<Rating> => {
  const { data } = await instance.put(`/ratings/${id}`, { rating });
  return data;
};

const deleteRating = async (id: string): Promise<void> => {
  await instance.delete(`/ratings/${id}`);
};

export { addRating, deleteRating, getRecipeRatings, updateRating };
export type { RatingResponse };
