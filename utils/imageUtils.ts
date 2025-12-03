import { Platform } from "react-native";

// Get the base URL for images
const getImageBaseURL = () => {
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

/**
 * Converts a relative image URL to an absolute URL
 * @param imageUrl - The image URL from the backend (can be relative or absolute)
 * @returns Absolute URL for the image
 */
export const getImageUrl = (
  imageUrl: string | undefined | null
): string | undefined => {
  if (!imageUrl) {
    return undefined;
  }

  // If it's already an absolute URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's a relative URL, prepend the base URL
  const baseURL = getImageBaseURL();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${baseURL}${cleanPath}`;
};
