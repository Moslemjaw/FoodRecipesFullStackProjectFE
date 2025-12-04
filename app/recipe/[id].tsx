import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Animated,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { getRecipeById } from "@/api/recipes";
import { addFavorite, removeFavorite, checkFavorite } from "@/api/favorites";
import { getRecipeRatings, addRating, updateRating } from "@/api/ratings";
import { getImageUrl } from "@/utils/imageUtils";
import Recipe, { RecipeIngredient } from "@/types/Recipe";
import User from "@/types/User";
import AuthContext from "@/context/AuthContext";
import { me } from "@/api/auth";

import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { StarRating } from "@/components/Liqmah/StarRating";
import { Colors, Layout, Typography } from "@/constants/LiqmahTheme";
import {
  X,
  Heart,
  Clock,
  Tag,
  User as UserIcon,
  Utensils,
  ChevronDown,
} from "lucide-react-native";

const { height } = Dimensions.get("window");

export default function RecipeDetails() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAutheticated } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  const id = params.id || (params as any).id;

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: me,
    enabled: isAutheticated,
  });

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Recipe ID is required");
      }
      return getRecipeById(id);
    },
    enabled: !!id,
  });

  const { data: favoriteStatus } = useQuery({
    queryKey: ["favorite", id],
    queryFn: () => checkFavorite(id!),
    enabled: !!id && isAutheticated,
  });

  const { data: ratingsData } = useQuery({
    queryKey: ["ratings", id],
    queryFn: () => getRecipeRatings(id!),
    enabled: !!id,
  });

  const userRatingData = useMemo(() => {
    if (!ratingsData?.ratings || !currentUser) return null;
    return ratingsData.ratings.find((rating: any) => {
      const userId = typeof rating.userID === "object" ? rating.userID._id : rating.userID;
      return userId === currentUser._id;
    });
  }, [ratingsData, currentUser]);

  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorite(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

  useEffect(() => {
    if (userRatingData) {
      setUserRating(userRatingData.rating);
    }
  }, [userRatingData]);

  useEffect(() => {
    // Slide up animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const favoriteMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      if (isFavorite) {
        await removeFavorite(recipeId);
      } else {
        await addFavorite(recipeId);
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["favorite", id] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update favorite"
      );
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!id) throw new Error("Recipe ID is required");
      if (userRatingData) {
        await updateRating(userRatingData._id, rating);
      } else {
        await addRating(id, rating);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", id] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update rating"
      );
    },
  });

  const handleFavorite = () => {
    if (!isAutheticated) {
      Alert.alert(
        "Sign in Required",
        "Please sign in to favorite recipes.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }

    if (id) {
      favoriteMutation.mutate(id);
    }
  };

  const handleRatingChange = (rating: number) => {
    if (!isAutheticated) {
      Alert.alert(
        "Sign in Required",
        "Please sign in to rate recipes.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }
    setUserRating(rating);
    ratingMutation.mutate(rating);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  if (isLoading) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.mint} />
        </View>
      </LiqmahBackground>
    );
  }

  if (!id || error || !recipe) {
    return (
      <LiqmahBackground>
        <View style={styles.errorContainer}>
          <LiqmahText variant="headline" color={Colors.text.secondary}>
            Recipe not found
          </LiqmahText>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <LiqmahText color={Colors.primary.mint}>Go Back</LiqmahText>
          </TouchableOpacity>
        </View>
      </LiqmahBackground>
    );
  }

  const categoryName =
    typeof recipe.categoryId === "object" && recipe.categoryId
      ? recipe.categoryId.name
      : "Uncategorized";

  const userName =
    typeof recipe.userId === "object" && recipe.userId
      ? recipe.userId.name || recipe.userId.email
      : "Unknown User";

  const recipeImageUrl = getImageUrl(recipe.image);
  const averageRating = ratingsData?.averageRating || 0;
  const totalRatings = ratingsData?.totalRatings || 0;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>

        {/* Slide-up Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LiqmahBackground>
            {/* Header Image */}
            <View style={styles.headerImageContainer}>
              {recipeImageUrl ? (
                <Image
                  source={{ uri: recipeImageUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.headerImage, styles.placeholderImage]}>
                  <Utensils size={64} color={Colors.text.tertiary} />
                </View>
              )}
              <LinearGradient
                colors={Colors.gradients.topOverlay}
                style={styles.headerOverlay}
              />

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButtonTop} onPress={handleClose}>
                <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
                  <X size={24} color="#FFFFFF" />
                </BlurView>
              </TouchableOpacity>

              {/* Title Overlay */}
              <View style={styles.titleOverlay}>
                <LiqmahText
                  variant="display"
                  weight="extraBold"
                  color={Colors.text.overlay}
                  style={styles.headerTitle}
                >
                  {recipe.title}
                </LiqmahText>
                <View style={styles.headerMeta}>
                  <View style={styles.headerMetaItem}>
                    <Clock size={16} color={Colors.text.overlay} />
                    <LiqmahText variant="caption" color={Colors.text.overlay}>
                      {recipe.cookingTime} min
                    </LiqmahText>
                  </View>
                  <View style={styles.headerMetaItem}>
                    <Tag size={16} color={Colors.text.overlay} />
                    <LiqmahText variant="caption" color={Colors.text.overlay}>
                      {categoryName}
                    </LiqmahText>
                  </View>
                </View>
              </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <View style={styles.ratingRow}>
                  <StarRating rating={averageRating} readonly size={20} />
                  <LiqmahText variant="body" color={Colors.text.secondary} style={styles.ratingText}>
                    {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"} ({totalRatings})
                  </LiqmahText>
                </View>
                {isAutheticated && (
                  <View style={styles.userRatingRow}>
                    <LiqmahText variant="caption" color={Colors.text.secondary}>
                      Your rating:
                    </LiqmahText>
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRatingChange}
                      size={24}
                    />
                  </View>
                )}
              </View>

              {/* User Info */}
              <TouchableOpacity style={styles.userSection}>
                <View style={styles.userAvatar}>
                  <UserIcon size={20} color={Colors.text.tertiary} />
                </View>
                <View style={styles.userInfo}>
                  <LiqmahText variant="micro" color={Colors.text.tertiary}>
                    Created by
                  </LiqmahText>
                  <LiqmahText variant="body" weight="semiBold">
                    {userName}
                  </LiqmahText>
                </View>
                <TouchableOpacity
                  onPress={handleFavorite}
                  style={styles.favoriteButton}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart
                    size={24}
                    color={isFavorite ? "#EF4444" : Colors.text.secondary}
                    fill={isFavorite ? "#EF4444" : "transparent"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Ingredients */}
              <View style={styles.section}>
                <LiqmahText variant="section" weight="bold" style={styles.sectionTitle}>
                  Ingredients
                </LiqmahText>
                <View style={styles.ingredientsList}>
                  {recipe.ingredients.map((ingredient: RecipeIngredient, index: number) => {
                    const ingredientName =
                      typeof ingredient.ingredientId === "object" &&
                      ingredient.ingredientId
                        ? ingredient.ingredientId.name
                        : "Unknown Ingredient";
                    return (
                      <View key={ingredient._id || index} style={styles.ingredientItem}>
                        <View style={styles.ingredientBullet} />
                        <LiqmahText style={styles.ingredientText}>
                          <LiqmahText weight="bold">
                            {ingredient.quantity} {ingredient.unit}{" "}
                          </LiqmahText>
                          {ingredientName}
                        </LiqmahText>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.section}>
                <LiqmahText variant="section" weight="bold" style={styles.sectionTitle}>
                  Instructions
                </LiqmahText>
                <View style={styles.instructionsContainer}>
                  <LiqmahText style={styles.instructionsText}>
                    {Array.isArray(recipe.instructions)
                      ? recipe.instructions.join("\n\n")
                      : recipe.instructions}
                  </LiqmahText>
                </View>
              </View>
            </ScrollView>
          </LiqmahBackground>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.9,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    backgroundColor: Colors.base.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  closeButton: {
    marginTop: 24,
    padding: 12,
  },
  headerImageContainer: {
    height: 300,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: Colors.base.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButtonTop: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.xl,
    paddingBottom: Layout.spacing.lg,
  },
  headerTitle: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: Layout.spacing.sm,
  },
  headerMeta: {
    flexDirection: "row",
    gap: Layout.spacing.md,
  },
  headerMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Layout.radius.pill,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.xl,
    paddingBottom: 100,
  },
  ratingSection: {
    marginBottom: Layout.spacing.xl,
    paddingBottom: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.base.border.light,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  ratingText: {
    marginLeft: 4,
  },
  userRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.md,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: Layout.spacing.md,
    backgroundColor: Colors.base.surface,
    borderRadius: Layout.radius.card,
    marginBottom: Layout.spacing.xl,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.base.cloud,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  favoriteButton: {
    padding: Layout.spacing.sm,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Layout.spacing.lg,
  },
  ingredientsList: {
    backgroundColor: Colors.base.surface,
    borderRadius: Layout.radius.card,
    padding: Layout.spacing.lg,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.base.border.light,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.mint,
    marginRight: Layout.spacing.md,
  },
  ingredientText: {
    flex: 1,
    lineHeight: 24,
  },
  instructionsContainer: {
    backgroundColor: Colors.base.surface,
    borderRadius: Layout.radius.card,
    padding: Layout.spacing.lg,
  },
  instructionsText: {
    lineHeight: 28,
    color: Colors.text.secondary,
  },
});
