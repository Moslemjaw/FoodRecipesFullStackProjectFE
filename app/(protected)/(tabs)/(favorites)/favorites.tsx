import { getMyFavorites, removeFavorite } from "@/api/favorites";
import Favorite from "@/types/Favorite";
import Recipe from "@/types/Recipe";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    mutationFn: async (recipeID: string) => {
      console.log(
        "mutationFn called - Removing favorite for recipe:",
        recipeID
      );
      console.log("Calling removeFavorite API with recipeID:", recipeID);
      try {
        await removeFavorite(recipeID);
        console.log("removeFavorite API call completed successfully");
      } catch (error) {
        console.error("Error in removeFavorite API call:", error);
        throw error;
      }
    },
    onMutate: async (recipeID: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["favorites"] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>([
        "favorites",
      ]);

      // Optimistically update to remove the favorite immediately
      if (previousFavorites) {
        queryClient.setQueryData<Favorite[]>(["favorites"], (old) => {
          if (!old) return old;
          return old.filter((fav: Favorite) => {
            const favRecipeId =
              typeof fav.recipeID === "object" && fav.recipeID
                ? (fav.recipeID as any)._id
                : fav.recipeID;
            return favRecipeId !== recipeID;
          });
        });
      }

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (error: any, recipeID: string, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
      console.error("Remove favorite error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to remove favorite"
      );
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
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
    console.log("handleRemoveFavorite called with:", { recipeId, recipeTitle });

    const confirmRemoval = () => {
      console.log("User confirmed removal of recipe:", recipeId);
      console.log("Calling removeFavoriteMutation.mutate with:", recipeId);
      removeFavoriteMutation.mutate(recipeId, {
        onSuccess: () => {
          console.log("Mutation succeeded!");
        },
        onError: (error) => {
          console.log("Mutation error:", error);
        },
      });
    };

    // Alert.alert doesn't work reliably on web, so use window.confirm for web
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to remove "${recipeTitle}" from your favorites?`
      );
      if (confirmed) {
        confirmRemoval();
      } else {
        console.log("User cancelled removal (web)");
      }
    } else {
      // Use Alert.alert for native platforms
      Alert.alert(
        "Remove Favorite",
        `Are you sure you want to remove "${recipeTitle}" from your favorites?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              console.log("User cancelled removal");
            },
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: confirmRemoval,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const categoryName =
      item.categoryId && typeof item.categoryId === "object"
        ? Array.isArray(item.categoryId)
          ? item.categoryId[0]?.name || "Uncategorized"
          : (item.categoryId as any).name || "Uncategorized"
        : "Uncategorized";

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item._id)}
        activeOpacity={0.8}
      >
        {getImageUrl(item.image) ? (
          <Image
            source={{ uri: getImageUrl(item.image)! }}
            style={styles.recipeImage}
            onError={(error) => {
              console.error(
                `Favorite image load error:`,
                error.nativeEvent.error
              );
              console.error(`Failed URL:`, getImageUrl(item.image));
            }}
          />
        ) : (
          <View style={styles.recipeImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(
              "Heart button pressed for recipe:",
              item._id,
              item.title
            );
            console.log("Calling handleRemoveFavorite...");
            handleRemoveFavorite(item._id, item.title);
            console.log("handleRemoveFavorite call completed");
          }}
          disabled={removeFavoriteMutation.isPending}
        >
          <Ionicons
            name="heart"
            size={20}
            color={removeFavoriteMutation.isPending ? "#9CA3AF" : "#EF4444"}
          />
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
