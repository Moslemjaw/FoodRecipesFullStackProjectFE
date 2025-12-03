import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getMyFavorites, removeFavorite } from "@/api/favorites";
import Recipe from "@/types/Recipe";
import Favorite from "@/types/Favorite";

export default function Favorites() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: favorites = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: getMyFavorites,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (recipeID: string) => removeFavorite(recipeID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to remove favorite"
      );
    },
  });

  // Extract recipes from favorites
  const recipes = useMemo(() => {
    return favorites
      .map((favorite: Favorite) => {
        const recipe =
          typeof favorite.recipeID === "object" ? favorite.recipeID : null;
        return recipe;
      })
      .filter((recipe): recipe is Recipe => recipe !== null);
  }, [favorites]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/(protected)/recipe/${recipeId}` as any);
  };

  const handleRemoveFavorite = (recipeId: string, recipeTitle: string) => {
    Alert.alert(
      "Remove Favorite",
      `Are you sure you want to remove "${recipeTitle}" from your favorites?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeFavoriteMutation.mutate(recipeId);
          },
        },
      ]
    );
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const categoryName =
      typeof item.categoryId === "object" && item.categoryId
        ? item.categoryId.name
        : "Uncategorized";

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item._id)}
        activeOpacity={0.8}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
        ) : (
          <View style={styles.recipeImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(item._id, item.title);
          }}
          disabled={removeFavoriteMutation.isPending}
        >
          <Ionicons name="heart" size={20} color="#EF4444" />
        </TouchableOpacity>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.recipeMeta}>
            {item.cookingTime && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{item.cookingTime} min</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{categoryName}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </Text>
      </View>

      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.recipesList}
        columnWrapperStyle={styles.recipeRow}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Start exploring recipes and add them to your favorites!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() =>
                router.push("/(protected)/(tabs)/(explore)" as any)
              }
            >
              <Text style={styles.exploreButtonText}>Explore Recipes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  recipesList: {
    padding: 16,
  },
  recipeRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  recipeCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    minHeight: 44,
  },
  recipeMeta: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
