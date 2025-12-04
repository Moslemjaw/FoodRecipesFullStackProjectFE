import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";

export const Colors = {
  primary: {
    fern: "#5B9A3A", // Brighter, fresher green for light mode
    sage: "#7FB069", // Softer sage green
    moss: "#6B8E4F", // Medium green
    mint: "#B8E5C8", // Lighter mint accent
  },
  base: {
    white: "#FFFFFF",
    black: "#000000",
    charcoal: "#1F2937", // Dark charcoal for text
    slate: "#6B7280", // Medium gray
    cloud: "#F8F9FA", // Off-white background
    surface: "#FFFFFF", // White surface
    background: "#FFFFFF", // Pure white background
    paper: "#FAFAFA", // Slightly off-white for cards
    glass: {
      light: "rgba(255, 255, 255, 0.7)", // Light glass overlay
      medium: "rgba(255, 255, 255, 0.85)",
      heavy: "rgba(255, 255, 255, 0.95)",
    },
    border: {
      light: "rgba(0, 0, 0, 0.08)",
      medium: "rgba(0, 0, 0, 0.12)",
      strong: "rgba(0, 0, 0, 0.2)",
    },
  },
  text: {
    primary: "#1F2937", // Dark charcoal for primary text
    secondary: "#6B7280", // Medium gray for secondary
    tertiary: "#9CA3AF", // Light gray for tertiary
    onPrimary: "#FFFFFF", // White text on colored backgrounds
    onGlass: "#1F2937",
    overlay: "#FFFFFF", // For text on images
    overlaySecondary: "rgba(255, 255, 255, 0.9)",
  },
  gradients: {
    // Overlay gradients for text readability on images
    imageOverlay: ["transparent", "rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.7)"],
    imageOverlayStrong: ["transparent", "rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.9)"],
    topOverlay: ["rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.15)", "transparent"],
    bottomOverlay: ["transparent", "rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.9)"],
    actionButton: ["rgba(91, 154, 58, 0.85)", "rgba(127, 176, 105, 0.9)"], // Fresher green gradient
    nature: ["#7FB069", "#6B8E4F", "#5B9A3A"], // Updated nature gradient
  },
};

export const Shadows = {
  floating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 12,
  },
  button: {
    fern: {
      shadowColor: "#5B9A3A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    mint: {
      shadowColor: "#5B9A3A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  dock: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 10,
  },
  glassCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 4,
  },
  aiBubble: {
    shadowColor: "rgba(0, 0, 0, 0.02)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  }
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
    display: 52, // Massive for overlay impact
    section: 36,
    headline: 28,
    body: 18,
    caption: 15,
    micro: 13,
  },
  overlay: {
    // Special styles for text on images
    title: {
      fontSize: 42,
      fontWeight: "800" as const,
      textShadowColor: "rgba(0, 0, 0, 0.8)",
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 12,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "600" as const,
      textShadowColor: "rgba(0, 0, 0, 0.8)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    caption: {
      fontSize: 14,
      fontWeight: "500" as const,
      textShadowColor: "rgba(0, 0, 0, 0.7)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
  },
};

export const Layout = {
  radius: {
    card: 28, // Modern rounded corners
    dock: 32,
    button: 24, // More rounded buttons
    input: 20,
    pill: 9999,
    modal: 32,
    bubble: 20,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64, // For dramatic whitespace
  },
};
