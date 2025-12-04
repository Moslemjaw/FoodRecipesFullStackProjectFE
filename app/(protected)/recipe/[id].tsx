import { getCategoryById } from "@/api/categories";
import { addFavorite, checkFavorite, removeFavorite } from "@/api/favorites";
import { getRecipeById } from "@/api/recipes";
import { RecipeIngredient } from "@/types/Recipe";
import User from "@/types/User";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecipeDetails() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get ID from route params (works with both /recipe/[id] and ?id=)
  const id = params.id || (params as any).id;

  console.log("Recipe Details - ID:", id, "Params:", params);

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
      console.log("Fetching recipe with ID:", id);
      return getRecipeById(id);
    },
    enabled: !!id,
  });

  // Extract category ID handling potential array from backend
  const recipeCategoryId = React.useMemo(() => {
    if (!recipe?.categoryId) return null;

    // Case 1: It's an array (as per Backend.md)
    if (Array.isArray(recipe.categoryId)) {
      if (recipe.categoryId.length === 0) return null;
      const firstCat = recipe.categoryId[0];
      return typeof firstCat === "object" ? firstCat._id : firstCat;
    }

    // Case 2: It's a single object
    if (typeof recipe.categoryId === "object") {
      return (recipe.categoryId as any)._id || (recipe.categoryId as any).id;
    }

    // Case 3: It's a string ID
    return recipe.categoryId;
  }, [recipe]);

  const { data: category } = useQuery({
    queryKey: ["category", recipeCategoryId],
    queryFn: () => getCategoryById(recipeCategoryId as string),
    enabled: !!recipeCategoryId,
  });

  // Check favorite status using the checkFavorite function
  // This fetches all favorites and checks if current recipe is favorited
  const { data: favoriteStatus, isLoading: isLoadingFavorite } = useQuery({
    queryKey: ["favorite", id],
    queryFn: () => checkFavorite(id!),
    enabled: !!id,
    refetchOnMount: true, // Always check fresh status when component mounts
  });

  // Local state for optimistic updates
  const [isFavoriteState, setIsFavoriteState] = useState(false);

  // Update state when favoriteStatus changes
  useEffect(() => {
    if (favoriteStatus !== undefined) {
      setIsFavoriteState(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

  const favoriteMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const currentStatus = isFavoriteState;
      const newStatus = !currentStatus;

      // Optimistic update - update UI immediately
      setIsFavoriteState(newStatus);

      try {
        if (currentStatus) {
          // Currently favorited, so remove it
          console.log("Removing favorite for recipe:", recipeId);
          await removeFavorite(recipeId);
        } else {
          // Not favorited, so add it
          console.log("Adding favorite for recipe:", recipeId);
          await addFavorite(recipeId);
        }
      } catch (err) {
        // Revert optimistic update on error
        console.error("Favorite mutation failed, reverting:", err);
        setIsFavoriteState(currentStatus);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate queries to ensure all components have fresh data
      queryClient.invalidateQueries({ queryKey: ["favorite", id] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error: any) => {
      console.error("Favorite mutation error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update favorite"
      );
    },
  });

  const handleFavorite = () => {
    if (id) {
      favoriteMutation.mutate(id);
    }
  };

  const handleUserPress = (userId: string | User) => {
    const userID = typeof userId === "string" ? userId : userId._id;
    if (userID) {
      router.push(`/(protected)/(tabs)/(home)/${userID}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Recipe ID is missing</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>
          {error ? "Failed to load recipe" : "Recipe not found"}
        </Text>
        <Text style={styles.errorSubtext}>
          {error instanceof Error ? error.message : "Please try again later"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getCategoryName = () => {
    // 1. Try separate category query result
    if (category?.name) return category.name;

    // 2. Try populated category on recipe
    if (
      recipe.categoryId &&
      typeof recipe.categoryId === "object" &&
      "name" in recipe.categoryId
    ) {
      return (recipe.categoryId as any).name;
    }

    // 3. Handle case where categoryId might be an array (based on Backend.md)
    if (Array.isArray(recipe.categoryId) && recipe.categoryId.length > 0) {
      const firstCat = recipe.categoryId[0];
      if (typeof firstCat === "object" && "name" in firstCat) {
        return firstCat.name;
      }
    }

    return "Uncategorized";
  };

  const categoryName = getCategoryName();

  const userName =
    typeof recipe.userId === "object" && recipe.userId
      ? recipe.userId.name || recipe.userId.email
      : "Unknown User";

  const userImage =
    typeof recipe.userId === "object" && recipe.userId
      ? recipe.userId.image
      : undefined;

  const recipeImageUrl = getImageUrl(recipe.image);
  const userImageUrl = getImageUrl(userImage);

  // Debug logging
  if (recipe.image) {
    console.log(`Recipe Details - Original image:`, recipe.image);
    console.log(`Recipe Details - Processed image URL:`, recipeImageUrl);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Recipe Image */}
      {recipeImageUrl ? (
        <Image
          source={{ uri: recipeImageUrl }}
          style={styles.recipeImage}
          onError={(error) => {
            console.error(`Recipe image load error:`, error.nativeEvent.error);
            console.error(`Failed URL:`, recipeImageUrl);
          }}
          onLoad={() => {
            console.log(`Recipe image loaded successfully`);
          }}
        />
      ) : (
        <View style={styles.recipeImagePlaceholder}>
          <Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
        </View>
      )}

      {/* Header with Back Button and Favorite */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavoriteState && styles.favoriteButtonActive,
          ]}
          onPress={handleFavorite}
          disabled={favoriteMutation.isPending}
        >
          <Ionicons
            name={isFavoriteState ? "heart" : "heart-outline"}
            size={24}
            color={isFavoriteState ? "#EF4444" : "#111827"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Title and Meta Info */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.metaContainer}>
            {recipe.cookingTime && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text style={styles.metaText}>{recipe.cookingTime} min</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={18} color="#6B7280" />
              <Text style={styles.metaText}>{categoryName}</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <TouchableOpacity
          style={styles.userSection}
          onPress={() => handleUserPress(recipe.userId)}
        >
          {userImageUrl ? (
            <Image
              source={{ uri: userImageUrl }}
              style={styles.userAvatar}
              onError={(error) => {
                console.error(
                  `User image load error:`,
                  error.nativeEvent.error
                );
                console.error(`Failed URL:`, userImageUrl);
              }}
            />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Created by</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </TouchableOpacity>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map(
            (ingredient: RecipeIngredient, index: number) => {
              const ingredientName =
                typeof ingredient.ingredientId === "object" &&
                ingredient.ingredientId
                  ? ingredient.ingredientId.name
                  : "Unknown Ingredient";
              return (
                <View
                  key={ingredient._id || index}
                  style={styles.ingredientItem}
                >
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>
                    {ingredient.quantity} {ingredient.unit} {ingredientName}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>{recipe.instructions}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  recipeImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#F3F4F6",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: "#FEF2F2", // Light red background when active
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 8,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  instructionsText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "justify",
  },
});
