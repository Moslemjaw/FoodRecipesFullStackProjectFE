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
  formData.append("ingredients", JSON.stringify(ingredients));

  if (image) {
    formData.append("image", {
      name: "image.jpg",
      uri: image,
      type: "image/jpeg",
    } as any);
  }

  const { data } = await instance.post("/recipes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
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
