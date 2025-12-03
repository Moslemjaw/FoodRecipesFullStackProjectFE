import AsyncStorage from "@react-native-async-storage/async-storage";

const storeToken = async (value: string) => {
  try {
    await AsyncStorage.setItem("Token", value);
  } catch (error) {
    console.log(error);
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem("Token");
  } catch (error) {
    console.log(error);
  }
};

const deleteToken = async () => {
  try {
    await AsyncStorage.removeItem("Token");
  } catch (error) {
    console.log(error);
  }
};

export { storeToken, getToken, deleteToken };
