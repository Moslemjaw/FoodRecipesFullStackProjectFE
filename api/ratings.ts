import Rating from "@/types/Rating";
import instance from ".";

interface RatingResponse {
  ratings: Rating[];
  totalRatings: number;
  averageRating: number;
}

const addRating = async (recipeID: string, rating: number): Promise<Rating> => {
  // Validate inputs
  if (!recipeID) {
    throw new Error("Recipe ID is required");
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  
  // Backend.md: POST /ratings with { "recipeID": "...", "rating": 5 }
  // Ensure rating is a number, not a string
  const ratingNumber = typeof rating === "string" ? parseInt(rating, 10) : rating;
  if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }
  
  const { data } = await instance.post("/ratings", { 
    recipeID: recipeID, // Ensure exact field name matches Backend.md
    rating: ratingNumber // Ensure it's a number
  });
  return data;
};

const getRecipeRatings = async (recipeId: string): Promise<RatingResponse> => {
  const { data } = await instance.get(`/ratings/recipe/${recipeId}`);
  return data;
};

const updateRating = async (ratingID: string, rating: number): Promise<Rating> => {
  // Validate inputs
  if (!ratingID) {
    throw new Error("Rating ID is required");
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  
  // Backend.md: PUT /ratings/:ratingID with { "rating": 3 }
  // Ensure rating is a number, not a string
  const ratingNumber = typeof rating === "string" ? parseInt(rating, 10) : rating;
  if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }
  
  const { data } = await instance.put(`/ratings/${ratingID}`, { 
    rating: ratingNumber // Ensure it's a number
  });
  return data;
};

const deleteRating = async (id: string): Promise<void> => {
  await instance.delete(`/ratings/${id}`);
};

export { addRating, deleteRating, getRecipeRatings, updateRating };
export type { RatingResponse };
