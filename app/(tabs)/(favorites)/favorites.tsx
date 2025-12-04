import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getMyFavorites, removeFavorite } from "@/api/favorites";
import { getImageUrl } from "@/utils/imageUtils";
import Recipe from "@/types/Recipe";
import Favorite from "@/types/Favorite";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahGlass } from "@/components/Liqmah/LiqmahGlass";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { Colors, Layout, Shadows } from "@/constants/LiqmahTheme";
import { Heart, Clock, Tag, Utensils } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    router.push(`/recipe/${recipeId}` as any);
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

    const imageUrl = getImageUrl(item.image);

    return (
      <TouchableOpacity
        style={styles.recipeCardContainer}
        onPress={() => handleRecipePress(item._id)}
        activeOpacity={0.9}
      >
        <LiqmahGlass intensity={80} style={styles.recipeCard}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.recipeImage}
            />
          ) : (
            <View style={styles.recipeImagePlaceholder}>
              <Utensils size={40} color={Colors.text.tertiary} />
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
            <Heart size={20} color="#EF4444" fill="#EF4444" />
          </TouchableOpacity>

          <View style={styles.recipeInfo}>
            <LiqmahText variant="body" weight="semiBold" style={styles.recipeTitle} numberOfLines={2}>
              {item.title}
            </LiqmahText>
            <View style={styles.recipeMeta}>
              {item.cookingTime && (
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.text.secondary} />
                  <LiqmahText variant="micro" color={Colors.text.secondary}>{item.cookingTime} min</LiqmahText>
                </View>
              )}
              <View style={styles.metaItem}>
                <Tag size={14} color={Colors.text.secondary} />
                <LiqmahText variant="micro" color={Colors.text.secondary}>{categoryName}</LiqmahText>
              </View>
            </View>
          </View>
        </LiqmahGlass>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.fern} />
          <LiqmahText style={styles.loadingText}>Loading favorites...</LiqmahText>
        </View>
      </LiqmahBackground>
    );
  }

  return (
    <LiqmahBackground gradient={Colors.gradients.saffronSunrise}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <LiqmahText variant="display" weight="bold" style={styles.headerTitle}>
            My Favorites
          </LiqmahText>
          <LiqmahText variant="body" color={Colors.text.secondary} style={styles.headerSubtitle}>
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} saved
          </LiqmahText>
        </View>

        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recipesList}
          columnWrapperStyle={styles.recipeRow}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary.fern}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={64} color={Colors.base.border.medium} />
              <LiqmahText variant="headline" weight="semiBold" color={Colors.text.secondary} style={styles.emptyText}>
                No favorites yet
              </LiqmahText>
              <LiqmahText variant="body" color={Colors.text.tertiary} style={styles.emptySubtext}>
                Start exploring recipes and add them to your favorites!
              </LiqmahText>
              <LiqmahButton
                label="Explore Recipes"
                onPress={() => router.push("/(tabs)/(explore)/explore" as any)}
                style={styles.exploreButton}
              />
            </View>
          }
        />
      </SafeAreaView>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    color: Colors.text.secondary,
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
  },
  recipesList: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Space for dock
  },
  recipeRow: {
    justifyContent: "space-between",
    marginBottom: Layout.spacing.md,
  },
  recipeCardContainer: {
    width: "48%",
  },
  recipeCard: {
    borderRadius: Layout.radius.card,
    overflow: "hidden",
    padding: 0,
    ...Shadows.glassCard,
  },
  recipeImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.base.cloud,
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.base.cloud,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.base.white,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.button.mint,
  },
  recipeInfo: {
    padding: Layout.spacing.md,
  },
  recipeTitle: {
    marginBottom: Layout.spacing.xs,
    minHeight: 40,
  },
  recipeMeta: {
    flexDirection: "row",
    gap: Layout.spacing.sm,
    flexWrap: "wrap",
    marginTop: Layout.spacing.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Layout.spacing.xxl,
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyText: {
    marginTop: Layout.spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: Layout.spacing.xs,
    textAlign: "center",
    marginBottom: Layout.spacing.lg,
  },
  exploreButton: {
    width: "100%",
  },
});
