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
  categoryId: string,
  ingredients: RecipeIngredient[],
  image?: string
): Promise<Recipe> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("instructions", instructions);
  formData.append("cookingTime", cookingTime.toString());
  formData.append("categoryId", categoryId);

  // Append ingredients as JSON string
  formData.append("ingredients", JSON.stringify(ingredients));

  if (image) {
    // Extract filename from URI if possible
    const filename = image.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("image", {
      uri: image,
      name: filename,
      type: type,
    } as any);
  }

  console.log("Creating recipe with data:", {
    title,
    instructions: instructions.substring(0, 50) + "...",
    cookingTime,
    categoryId,
    ingredientsCount: ingredients.length,
    ingredients: ingredients,
    hasImage: !!image,
  });

  // Validate required fields
  if (!title || !instructions || !categoryId) {
    throw new Error(
      "Missing required fields: title, instructions, or categoryId"
    );
  }
  if (!ingredients || ingredients.length === 0) {
    throw new Error("At least one ingredient is required");
  }
  if (cookingTime <= 0) {
    throw new Error("Cooking time must be greater than 0");
  }

  try {
    // Don't set Content-Type header - let axios set it automatically with boundary
    const { data } = await instance.post("/recipes", formData);
    return data;
  } catch (error: any) {
    console.error("Recipe creation API error:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    throw error;
  }
};

const updateRecipe = async (
  id: string,
  title: string,
  instructions: string,
  cookingTime: number,
  categoryId: string,
  ingredients: RecipeIngredient[],
  image?: string
): Promise<Recipe> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("instructions", instructions);
  formData.append("cookingTime", cookingTime.toString());
  formData.append("categoryId", categoryId);
  formData.append("ingredients", JSON.stringify(ingredients));

  if (image) {
    formData.append("image", {
      name: "image.jpg",
      uri: image,
      type: "image/jpeg",
    } as any);
  }

  const { data } = await instance.put(`/recipes/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
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

export {
  createRecipe,
  deleteRecipe,
  filterByIngredients,
  filterOutIngredients,
  getAllRecipes,
  getMyRecipes,
  getRecipeById,
  getRecipesByCategory,
  updateRecipe,
};
