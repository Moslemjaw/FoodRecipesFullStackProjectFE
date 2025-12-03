import Category from "@/types/Category";
import instance from ".";

const getAllCategories = async (): Promise<Category[]> => {
  const { data } = await instance.get("/categories");
  return data;
};

const getCategoryById = async (id: string): Promise<Category> => {
  const { data } = await instance.get(`/categories/${id}`);
  return data;
};

const createCategory = async (name: string): Promise<Category> => {
  const { data } = await instance.post("/categories", { name });
  return data;
};

const updateCategory = async (id: string, name: string): Promise<Category> => {
  const { data } = await instance.put(`/categories/${id}`, { name });
  return data;
};

const deleteCategory = async (id: string): Promise<void> => {
  await instance.delete(`/categories/${id}`);
};

export {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
};
