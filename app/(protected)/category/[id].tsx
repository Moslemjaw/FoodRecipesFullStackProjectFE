import { getCategoryById } from "@/api/categories";
import { getAllRecipes, getRecipesByCategory } from "@/api/recipes";
import Recipe from "@/types/Recipe";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CategoryDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: category } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id as string),
    enabled: !!id,
  });

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipesByCategory", id],
    queryFn: () => getRecipesByCategory(id as string),
    enabled: !!id,
  });

  const { data: allRecipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: getAllRecipes, // Use getAllRecipes to filter manually if endpoint is unreliable
    enabled: true,
  });

  // Fallback filtering if the specific endpoint isn't filtering correctly
  const filteredRecipes = React.useMemo(() => {
    // Function to check if a recipe belongs to the current category
    const belongsToCategory = (r: Recipe) => {
      const rCat = r.categoryId;

      // Handle array case (Backend.md says categoryId: Category[])
      if (Array.isArray(rCat)) {
        return rCat.some((c) => {
          const cId = typeof c === "object" ? c._id : c;
          return cId === id;
        });
      }

      // Handle single object/string case
      const catId =
        typeof rCat === "object"
          ? (rCat as any)?._id || (rCat as any)?.id
          : rCat;
      return catId === id;
    };

    // If we have specific recipes from the endpoint, filter them to be sure
    if (recipes && recipes.length > 0) {
      const strictlyFiltered = recipes.filter(belongsToCategory);
      // If the endpoint returned relevant recipes (even if mixed with others), use them
      if (strictlyFiltered.length > 0) {
        return strictlyFiltered;
      }
    }

    // Fallback to allRecipes
    if (allRecipes) {
      return allRecipes.filter(belongsToCategory);
    }

    return [];
  }, [recipes, allRecipes, id]);

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const imageUrl = getImageUrl(item.image);
    const categoryName =
      typeof item.categoryId === "object" && item.categoryId
        ? (item.categoryId as any).name || (item.categoryId as any)[0]?.name
        : "Uncategorized";

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => router.push(`/(protected)/recipe/${item._id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
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
        <ActivityIndicator size="large" color="#3FC380" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: category?.name || "Category",
          headerStyle: {
            backgroundColor: "#F9FAFB",
          },
          headerTintColor: "#111111",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 0, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#111111" />
            </TouchableOpacity>
          ),
        }}
      />

      {filteredRecipes && filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="book-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Recipes Yet</Text>
          <Text style={styles.emptySubtitle}>
            There are no recipes in this category currently.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(protected)/(modals)/createRecipe")}
          >
            <Text style={styles.createButtonText}>Add a Recipe</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CategoryDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  row: {
    justifyContent: "space-between",
  },
  recipeCard: {
    width: "48%", // Added to match explore card width
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    height: 160, // Changed from 200 to match explore
    backgroundColor: "#E5E7EB",
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  // timeBadge styles removed as it's not in explore card style
  cardContent: {
    padding: 12, // Changed from 20 to match explore padding
  },
  recipeTitle: {
    fontSize: 16, // Changed from 18 to match explore
    fontWeight: "600", // Changed from 700 to match explore
    color: "#111827",
    marginBottom: 8, // Changed from 12
    lineHeight: 20, // Adjusted
    minHeight: 40, // Added minHeight for consistency
  },
  metaRow: {
    flexDirection: "row",
    gap: 12, // Changed from 16
    flexWrap: "wrap", // Added flexWrap
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Changed from 6
  },
  metaText: {
    fontSize: 12, // Changed from 13
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: -60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: "#3FC380",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#3FC380",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
