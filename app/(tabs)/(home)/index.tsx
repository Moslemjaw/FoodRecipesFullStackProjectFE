import { getAllRecipes } from "@/api/recipes";
import { getAllCategories } from "@/api/categories";
import { Heart, Bookmark, Share2, Clock, Tag, User } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
} from "react-native";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { Colors, Layout, Typography, Shadows } from "@/constants/LiqmahTheme";
import { getImageUrl } from "@/utils/imageUtils";
import Recipe from "@/types/Recipe";
import Category from "@/types/Category";
import { Utensils } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, checkFavorite } from "@/api/favorites";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { Alert } from "react-native";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
const CARD_MARGIN = Layout.spacing.md;
const CARD_WIDTH = width - CARD_MARGIN * 2;
const IMAGE_ASPECT_RATIO = 4 / 5; // Modern portrait aspect ratio

const Home = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAutheticated } = useContext(AuthContext);
  const flatListRef = useRef<FlatList>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: getAllRecipes,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    let filtered = [...recipes].reverse(); // Show newest first
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter((recipe) => {
        const categoryId =
          typeof recipe.categoryId === "string"
            ? recipe.categoryId
            : recipe.categoryId?._id;
        return categoryId === selectedCategory;
      });
    }
    
    return filtered;
  }, [recipes, selectedCategory]);

  const favoriteMutation = useMutation({
    mutationFn: async (recipeId: string, isFavorited: boolean) => {
      if (isFavorited) {
        await removeFavorite(recipeId);
      } else {
        await addFavorite(recipeId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorite", variables[0]] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleFavorite = (recipeId: string, currentFavorite: boolean) => {
    if (!isAutheticated) {
      Alert.alert("Sign in Required", "Please sign in to favorite recipes.");
      return;
    }
    favoriteMutation.mutate([recipeId, currentFavorite]);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}` as any);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const renderCategoryChip = (category: Category) => {
    const isSelected = selectedCategory === category._id;
    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(category._id)}
        activeOpacity={0.8}
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipSelected,
        ]}
      >
        <LiqmahText
          variant="caption"
          weight={isSelected ? "semiBold" : "medium"}
          color={isSelected ? Colors.text.onPrimary : Colors.text.secondary}
        >
          {category.name}
        </LiqmahText>
      </TouchableOpacity>
    );
  };

  const renderRecipeItem = ({ item, index }: { item: Recipe; index: number }) => {
    const imageUrl = getImageUrl(item.image);
    const categoryName =
      typeof item.categoryId === "object" && item.categoryId
        ? item.categoryId.name
        : "General";
    const userName =
      typeof item.userId === "object" && item.userId
        ? item.userId.name || item.userId.email
        : "Chef";

    // Use favorites map from component state
    const isFavorite = favoritesMap[item._id] || false;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => handleRecipePress(item._id)}
          style={styles.card}
        >
          {/* Image Container */}
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.cardImage, styles.placeholderImage]}>
                <Utensils size={64} color={Colors.text.tertiary} />
              </View>
            )}

            {/* Floating Action Buttons on Right Side */}
            <View style={styles.floatingActions}>
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => {
                  const newFavorite = !isFavorite;
                  setFavoritesMap((prev) => ({ ...prev, [item._id]: newFavorite }));
                  handleFavorite(item._id, isFavorite);
                }}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="light" style={styles.floatingButtonBlur}>
                  <Heart
                    size={20}
                    color={isFavorite ? "#EF4444" : Colors.text.primary}
                    fill={isFavorite ? "#EF4444" : "transparent"}
                  />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
                <BlurView intensity={80} tint="light" style={styles.floatingButtonBlur}>
                  <Bookmark size={20} color={Colors.text.primary} />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
                <BlurView intensity={80} tint="light" style={styles.floatingButtonBlur}>
                  <Share2 size={20} color={Colors.text.primary} />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* User Info */}
            <View style={styles.userRow}>
              <View style={styles.userAvatar}>
                <User size={16} color={Colors.text.tertiary} />
              </View>
              <LiqmahText variant="caption" weight="semiBold" color={Colors.text.secondary}>
                {userName}
              </LiqmahText>
            </View>

            {/* Title */}
            <LiqmahText
              variant="headline"
              weight="bold"
              color={Colors.text.primary}
              style={styles.recipeTitle}
              numberOfLines={2}
            >
              {item.title}
            </LiqmahText>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Clock size={14} color={Colors.text.secondary} />
                <LiqmahText variant="micro" color={Colors.text.secondary} style={styles.metaText}>
                  {item.cookingTime} min
                </LiqmahText>
              </View>
              <View style={styles.metaChip}>
                <Tag size={14} color={Colors.text.secondary} />
                <LiqmahText variant="micro" color={Colors.text.secondary} style={styles.metaText}>
                  {categoryName}
                </LiqmahText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoadingRecipes) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.fern} />
        </View>
      </LiqmahBackground>
    );
  }

  if (!filteredRecipes || filteredRecipes.length === 0) {
    return (
      <LiqmahBackground>
        <View style={styles.emptyContainer}>
          <Utensils size={64} color={Colors.text.tertiary} />
          <LiqmahText variant="headline" color={Colors.text.secondary} style={styles.emptyText}>
            No recipes yet
          </LiqmahText>
        </View>
      </LiqmahBackground>
    );
  }

  return (
    <LiqmahBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <LiqmahText variant="section" weight="bold" color={Colors.text.primary}>
            Discover Recipes
          </LiqmahText>
        </View>

        {/* Categories Section */}
        {!isLoadingCategories && categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={({ item }) => renderCategoryChip(item)}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Recipes Feed */}
        <FlatList
          ref={flatListRef}
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Utensils size={64} color={Colors.text.tertiary} />
              <LiqmahText variant="headline" color={Colors.text.secondary} style={styles.emptyText}>
                {selectedCategory ? "No recipes in this category" : "No recipes yet"}
              </LiqmahText>
            </View>
          }
        />
      </View>
    </LiqmahBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.xl,
    minHeight: 300,
  },
  emptyText: {
    marginTop: Layout.spacing.lg,
    textAlign: "center",
  },
  categoriesSection: {
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.base.border.light,
  },
  categoriesList: {
    paddingHorizontal: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.button,
    backgroundColor: Colors.base.paper,
    borderWidth: 1,
    borderColor: Colors.base.border.medium,
    marginRight: Layout.spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary.fern,
    borderColor: Colors.primary.fern,
  },
  listContent: {
    paddingVertical: Layout.spacing.md,
    paddingBottom: 100, // Space for nav bar
  },
  cardContainer: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: Layout.spacing.lg,
  },
  card: {
    backgroundColor: Colors.base.surface,
    borderRadius: Layout.radius.card,
    overflow: "hidden",
    ...Shadows.card,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: IMAGE_ASPECT_RATIO,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: Layout.radius.card,
    borderTopRightRadius: Layout.radius.card,
  },
  placeholderImage: {
    backgroundColor: Colors.base.paper,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingActions: {
    position: "absolute",
    right: Layout.spacing.md,
    top: Layout.spacing.md,
    alignItems: "center",
    gap: Layout.spacing.sm,
    zIndex: 10,
  },
  floatingButton: {
    marginBottom: 0,
  },
  floatingButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  contentSection: {
    padding: Layout.spacing.lg,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.base.paper,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.base.border.light,
  },
  recipeTitle: {
    marginBottom: Layout.spacing.md,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: "row",
    gap: Layout.spacing.sm,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.base.paper,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Layout.radius.button,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
  },
  metaText: {
    marginLeft: 2,
  },
});
