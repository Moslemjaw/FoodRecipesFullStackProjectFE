import Ingredient from "@/types/Ingredient";
import instance from ".";

const getAllIngredients = async (): Promise<Ingredient[]> => {
  const { data } = await instance.get("/ingredients");
  return data;
};

const searchIngredients = async (name: string): Promise<Ingredient[]> => {
  const { data } = await instance.get(`/ingredients/search?name=${name}`);
  return data;
};

const createIngredient = async (name: string): Promise<Ingredient> => {
  const { data } = await instance.post("/ingredients", { name });
  return data;
};

const deleteIngredient = async (id: string): Promise<void> => {
  await instance.delete(`/ingredients/${id}`);
};

export {
  createIngredient,
  deleteIngredient,
  getAllIngredients,
  searchIngredients,
};
