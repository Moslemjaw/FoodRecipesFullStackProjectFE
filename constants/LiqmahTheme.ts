import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";

export const Colors = {
  primary: {
    mint: "#3FC380",
    aqua: "#42B8B2",
    saffron: "#FFD464",
  },
  base: {
    white: "#FFFFFF",
    black: "#000000",
    charcoal: "#111827",
    slate: "#4B5563",
    cloud: "#0A0A0A", // Very dark gray
    surface: "#1A1A1A", // Dark surface
    background: "#000000", // Pure black for immersive mode
    glass: {
      light: "rgba(0, 0, 0, 0.4)", // Dark glass overlay
      medium: "rgba(0, 0, 0, 0.6)",
      heavy: "rgba(0, 0, 0, 0.8)",
    },
    border: {
      light: "rgba(255, 255, 255, 0.1)",
      medium: "rgba(255, 255, 255, 0.15)",
      strong: "rgba(255, 255, 255, 0.25)",
    },
  },
  text: {
    primary: "#FFFFFF", // White text on dark
    secondary: "#D1D5DB", // Light gray
    tertiary: "#9CA3AF", // Medium gray
    onPrimary: "#000000",
    onGlass: "#FFFFFF",
    overlay: "#FFFFFF", // For text on images
    overlaySecondary: "rgba(255, 255, 255, 0.85)",
  },
  gradients: {
    // Overlay gradients for text readability on images
    imageOverlay: ["transparent", "rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.85)"],
    imageOverlayStrong: ["transparent", "rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.98)"],
    topOverlay: ["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.2)", "transparent"],
    bottomOverlay: ["transparent", "rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.98)"],
    actionButton: ["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.5)"], // For floating action buttons
  },
};

export const Shadows = {
  floating: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 12,
  },
  button: {
    mint: {
      shadowColor: "#3FC380",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  dock: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  glassCard: {
    shadowColor: "transparent", // No shadow for glass cards in clean mode
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  aiBubble: {
    shadowColor: "rgba(17, 24, 39, 0.03)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
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
    card: 32, // Softer, more organic
    dock: 40,
    button: 20, // Pill shape
    input: 20,
    pill: 9999,
    modal: 40,
    bubble: 24,
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
