import UserInfo from "@/types/UserInfo";
import instance from ".";

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
  try {
    // First try to get user from storage
    const { getUser, decodeToken, getToken, storeUser } = await import("./storage");
    const storedUser = await getUser();
    if (storedUser) {
      return storedUser;
    }

    // If no stored user, try to decode token and fetch user by ID
    const token = await getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.id || decoded?.userId || decoded?._id) {
        const userId = decoded.id || decoded.userId || decoded._id;
        try {
          const { getUserById } = await import("./users");
          const user = await getUserById(userId);
          // Store user for future use
          await storeUser(user);
          return user;
        } catch (fetchError) {
          console.error("Error fetching user by ID:", fetchError);
          // Return null instead of throwing to prevent route errors
          return null;
        }
      }
    }
  } catch (error) {
    console.error("Error in me() function:", error);
    // Return null instead of throwing to prevent route errors
    return null;
  }

  // Return null if no user found instead of throwing
  return null;
};

// Note: getAllUsers is in api/users.ts (uses /users endpoint per Backend.md)

export { login, me, register };
