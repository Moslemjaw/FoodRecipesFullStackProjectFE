import { getAllCategories } from "@/api/categories";
import { getAllRecipes } from "@/api/recipes";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const router = useRouter();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: getAllRecipes,
  });

  if (isLoadingCategories || isLoadingRecipes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3FC380" />
      </View>
    );
  }

  if (!categories) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No categories found</Text>
      </View>
    );
  }

  const categoryData = categories?.map((category) => {
    const categoryRecipes =
      recipes?.filter((recipe) => {
        // Check if recipe has this category
        const rCat = recipe.categoryId;

        // Handle array case (Backend.md says categoryId: Category[])
        if (Array.isArray(rCat)) {
          return rCat.some((c) => {
            const cId = typeof c === "object" ? c._id : c;
            return cId === category._id;
          });
        }

        // Handle single object/string case (legacy/current behavior fallback)
        const cId =
          typeof rCat === "object"
            ? (rCat as any)?._id || (rCat as any)?.id
            : rCat;

        return cId === category._id;
      }) || [];

    // Find first recipe with an image
    const firstRecipeWithImage = categoryRecipes.find((recipe) => recipe.image);
    const categoryImage = firstRecipeWithImage
      ? getImageUrl(firstRecipeWithImage.image)
      : null;

    return {
      ...category,
      count: categoryRecipes.length,
      image: categoryImage,
    };
  });

  const renderCategory = ({ item }: { item: any }) => {
    const hasImage = !!item.image;
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => router.push(`/(protected)/category/${item._id}`)}
        activeOpacity={0.9}
      >
        {hasImage ? (
          <Image
            source={{ uri: item.image }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant-outline" size={32} color="#3FC380" />
          </View>
        )}
        <View style={[styles.overlay, hasImage && styles.overlayWithImage]}>
          <View style={styles.overlayContent}>
            <View style={styles.arrowContainer}>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={hasImage ? "#FFFFFF" : "#42B8B2"}
              />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.categoryName,
                  hasImage && styles.categoryNameWithImage,
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.recipeCount,
                  hasImage && styles.recipeCountWithImage,
                ]}
              >
                {item.count} {item.count === 1 ? "Recipe" : "Recipes"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Discover</Text>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>
      <FlatList
        data={categoryData}
        renderItem={renderCategory}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Light background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "System",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#42B8B2",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  row: {
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "48%",
    aspectRatio: 1, // Square cards
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4, // Android shadow
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayWithImage: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(63, 195, 128, 0.1)", // Mint with low opacity
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },
  categoryNameWithImage: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recipeCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  recipeCountWithImage: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  arrowContainer: {
    alignSelf: "flex-end",
  },
});
