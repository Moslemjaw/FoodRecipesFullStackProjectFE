import Recipe, { RecipeIngredient } from "@/types/Recipe";
import instance from ".";

const getAllRecipes = async (): Promise<Recipe[]> => {
  const { data } = await instance.get("/recipes");
  return data;
};

const getRecipeById = async (id: string): Promise<Recipe> => {
  const { data } = await instance.get(`/recipes/${id}`);
  return data;
};

const getMyRecipes = async (): Promise<Recipe[]> => {
  const { data } = await instance.get("/recipes/my-recipes");
  return data;
};

const getRecipesByCategory = async (categoryId: string): Promise<Recipe[]> => {
  const { data } = await instance.get(`/recipes/category/${categoryId}`);
  return data;
};

const createRecipe = async (
  title: string,
  instructions: string,
  cookingTime: number,
  categoryIds: string[],
  ingredients: RecipeIngredient[],
  image?: string
): Promise<Recipe> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("instructions", instructions);
  formData.append("cookingTime", cookingTime.toString());
  // Handle multiple categories - send as array or comma-separated string
  if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    categoryIds.forEach((catId) => {
      formData.append("categoryId", catId);
    });
  }
  formData.append("ingredients", JSON.stringify(ingredients));

  if (image) {
    console.log("Processing image:", image);

    // For web: blob: URLs need to be fetched and converted
    if (image.startsWith("blob:") || image.startsWith("data:")) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append("image", blob, "recipe-image.jpg");
        console.log("Blob image appended, size:", blob.size);
      } catch (err) {
        console.error("Error converting blob:", err);
      }
    } else {
      // For mobile: use uri/name/type object
      const filename = image.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: image,
        name: filename,
        type: type,
      } as any);
    }
  }

  try {
    const { data } = await instance.post("/recipes", formData);
    return data;
  } catch (error: any) {
    console.error("Recipe creation API error:", error);
    throw error;
  }
};

const updateRecipe = async (
  id: string,
  title: string,
  instructions: string,
  cookingTime: number,
  categoryIds: string[],
  ingredients: RecipeIngredient[],
  image?: string
): Promise<Recipe> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("instructions", instructions);
  formData.append("cookingTime", cookingTime.toString());
  // Handle multiple categories - send as array or comma-separated string
  if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    categoryIds.forEach((catId) => {
      formData.append("categoryId", catId);
    });
  }
  formData.append("ingredients", JSON.stringify(ingredients));

  if (image) {
    console.log("Processing image for update:", image);

    // For web: blob: URLs need to be fetched and converted
    if (image.startsWith("blob:") || image.startsWith("data:")) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append("image", blob, "recipe-image.jpg");
        console.log("Blob image appended, size:", blob.size);
      } catch (err) {
        console.error("Error converting blob:", err);
      }
    } else {
      // For mobile: use uri/name/type object
      const filename = image.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: image,
        name: filename,
        type: type,
      } as any);
    }
  }

  try {
    const { data } = await instance.put(`/recipes/${id}`, formData);
    return data;
  } catch (error: any) {
    console.error("Recipe update API error:", error);
    throw error;
  }
};

const deleteRecipe = async (id: string): Promise<void> => {
  await instance.delete(`/recipes/${id}`);
};

const filterByIngredients = async (
  ingredientIds: string[]
): Promise<Recipe[]> => {
  const { data } = await instance.post("/recipes/filter-by-ingredients", {
    ingredientIds,
  });
  return data;
};

const filterOutIngredients = async (
  ingredientIds: string[]
): Promise<Recipe[]> => {
  const { data } = await instance.post("/recipes/filter-out-ingredients", {
    ingredientIds,
  });
  return data;
};

const getFeedRecipes = async (): Promise<Recipe[]> => {
  // Get all recipes and filter by followed users and this week
  const { data: allRecipes } = await instance.get("/recipes");
  const { data: following } = await instance.get("/follow/following");

  // Get list of followed user IDs
  const followedUserIds = following.map((follow: any) => {
    const followingId =
      typeof follow.followingID === "object"
        ? follow.followingID._id
        : follow.followingID;
    return followingId;
  });

  // Calculate date for one week ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Filter recipes from followed users created in the last week
  const feedRecipes = allRecipes.filter((recipe: any) => {
    const recipeUserId =
      typeof recipe.userId === "object" ? recipe.userId._id : recipe.userId;

    // Check if recipe is from a followed user
    if (!followedUserIds.includes(recipeUserId)) {
      return false;
    }

    // Check if recipe was created in the last week
    if (recipe.createdAt) {
      const recipeDate = new Date(recipe.createdAt);
      return recipeDate >= oneWeekAgo;
    }

    return false;
  });

  // Sort by most recent (newest first)
  feedRecipes.sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  return feedRecipes;
};

export {
  createRecipe,
  deleteRecipe,
  filterByIngredients,
  filterOutIngredients,
  getAllRecipes,
  getFeedRecipes,
  getMyRecipes,
  getRecipeById,
  getRecipesByCategory,
  updateRecipe,
};
