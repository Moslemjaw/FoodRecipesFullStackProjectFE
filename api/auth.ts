import UserInfo from "@/types/UserInfo";
import { jwtDecode } from "jwt-decode";
import instance from ".";
import { getToken } from "./storage";

const login = async (userInfo: UserInfo) => {
  const { data } = await instance.post("/users/login", userInfo);
  return data;
};

const register = async (userInfo: UserInfo, image: string, name: string) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("email", userInfo.email);
  formData.append("password", userInfo.password);
  if (image) {
    formData.append("image", {
      name: "image.jpg",
      uri: image,
      type: "image/jpeg",
    } as any);
  }

  const { data } = await instance.post("/users/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

const me = async () => {
  const token = await getToken();
  if (token) {
    const decoded: any = jwtDecode(token);
    const { data } = await instance.get(`/users/${decoded.id}`);
    return data;
  }
};

const getAllUsers = async () => {
  const { data } = await instance.get("/users");
  return data;
};

const getUserById = async (userId: string) => {
  const { data } = await instance.get(`/users/${userId}`);
  return data;
};

export { getAllUsers, getUserById, login, me, register };
