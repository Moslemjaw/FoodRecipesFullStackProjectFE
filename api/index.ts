import axios from "axios";
import { Platform } from "react-native";

// Use localhost for web, and your computer's IP for mobile devices/emulators
// For Android emulator, use: http://10.0.2.2:8000
// For iOS simulator, localhost works, but for physical device use your IP
// For physical devices, use your computer's local IP address
const getBaseURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }

  // For Android emulator
  if (Platform.OS === "android") {
    // Uncomment the line below if using Android emulator
    // return "http://10.0.2.2:8000";
    // For physical Android device, use your computer's IP
    return "http://192.168.8.196:8000";
  }

  // For iOS simulator, localhost works
  // For physical iOS device, use your computer's IP
  if (Platform.OS === "ios") {
    // Uncomment the line below if using iOS simulator
    // return "http://localhost:8000";
    // For physical iOS device, use your computer's IP
    return "http://192.168.8.196:8000";
  }

  // Default fallback
  return "http://192.168.8.196:8000";
};

const baseURL = getBaseURL();
console.log(`API Base URL: ${baseURL} (Platform: ${Platform.OS})`);

const instance = axios.create({
  baseURL: baseURL,
});

export default instance;
