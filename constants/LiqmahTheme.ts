import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";

export const Colors = {
  primary: {
    mint: "#3FC380",
    aqua: "#42B8B2",
    saffron: "#FFD464",
  },
  base: {
    white: "#FFFFFF",
    charcoal: "#111111",
    glass: {
      light: "rgba(255, 255, 255, 0.15)",
      medium: "rgba(255, 255, 255, 0.25)",
      heavy: "rgba(255, 255, 255, 0.40)",
    },
    border: {
      light: "rgba(255, 255, 255, 0.2)",
      medium: "rgba(255, 255, 255, 0.3)",
    },
  },
  text: {
    primary: "#111111", // Deep Charcoal for light mode
    secondary: "#4B5563", // Gray-600
    tertiary: "#9CA3AF", // Gray-400
    onPrimary: "#FFFFFF",
    onGlass: "#111111",
  },
  gradients: {
    mintMist: ["rgba(63, 195, 128, 0.15)", "rgba(66, 184, 178, 0.15)", "rgba(255, 255, 255, 0)"],
    saffronGlow: ["rgba(255, 212, 100, 0.15)", "rgba(63, 195, 128, 0.10)", "rgba(255, 255, 255, 0)"],
    aquaNightfall: ["rgba(66, 184, 178, 0.10)", "rgba(255, 255, 255, 0)", "rgba(0, 0, 0, 0.05)"],
  },
};

export const Shadows = {
  floating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1, // Reduced for light mode
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    mint: {
      shadowColor: "#3FC380",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  dock: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const Typography = {
  fonts: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  },
  sizes: {
    display: 34,
    section: 24,
    headline: 20,
    body: 16,
    caption: 13,
    micro: 11,
  },
};

export const Layout = {
  radius: {
    card: 24,
    dock: 32,
    button: 16,
    input: 16,
    pill: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

