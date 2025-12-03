import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getRecipeById } from "@/api/recipes";
import { addFavorite, removeFavorite, checkFavorite } from "@/api/favorites";
import { getImageUrl } from "@/utils/imageUtils";
import Recipe, { RecipeIngredient } from "@/types/Recipe";
import User from "@/types/User";
import Ingredient from "@/types/Ingredient";

export default function RecipeDetails() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

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

  const { data: favoriteStatus } = useQuery({
    queryKey: ["favorite", id],
    queryFn: () => checkFavorite(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorite(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

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

  const handleFavorite = () => {
    if (id) {
      favoriteMutation.mutate(id);
    }
  };

  const handleUserPress = (userId: string | User) => {
    const userID = typeof userId === "string" ? userId : userId._id;
    if (userID) {
      router.push(`/(protected)/user/${userID}` as any);
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

  const categoryName =
    typeof recipe.categoryId === "object" && recipe.categoryId
      ? recipe.categoryId.name
      : "Uncategorized";

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
          style={styles.favoriteButton}
          onPress={handleFavorite}
          disabled={favoriteMutation.isPending}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#EF4444" : "#111827"}
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
          activeOpacity={0.7}
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
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
          <Text style={styles.instructionsText}>
            {Array.isArray(recipe.instructions)
              ? recipe.instructions.join("\n\n")
              : recipe.instructions}
          </Text>
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    marginRight: 8,
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
