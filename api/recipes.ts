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
