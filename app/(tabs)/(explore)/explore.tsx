import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getAllRecipes } from "@/api/recipes";
import { getAllCategories } from "@/api/categories";
import { getImageUrl } from "@/utils/imageUtils";
import Recipe from "@/types/Recipe";
import Category from "@/types/Category";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahGlass } from "@/components/Liqmah/LiqmahGlass";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { Colors, Layout, Shadows } from "@/constants/LiqmahTheme";
import { Search, XCircle, Clock, Tag, Utensils } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const {
    data: recipes = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const data = await getAllRecipes();
      return data;
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
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
  }, [recipes, searchQuery, selectedCategory]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}` as any);
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

  const renderCategoryChip = (category: Category) => {
    const isSelected = selectedCategory === category._id;
    return (
      <TouchableOpacity
        key={category._id}
        onPress={() => setSelectedCategory(isSelected ? null : category._id)}
        activeOpacity={0.8}
      >
        <LiqmahGlass 
          intensity={isSelected ? 60 : 30} 
          style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
        >
          <LiqmahText
            variant="caption"
            weight={isSelected ? "medium" : "regular"}
            color={isSelected ? Colors.base.white : Colors.text.secondary}
          >
            {category.name}
          </LiqmahText>
        </LiqmahGlass>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.mint} />
          <LiqmahText style={styles.loadingText}>Loading recipes...</LiqmahText>
        </View>
      </LiqmahBackground>
    );
  }

  return (
    <LiqmahBackground gradient={Colors.gradients.aquaDaybreak}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Search Bar */}
        <View style={styles.header}>
          <LiqmahGlass intensity={50} style={styles.searchBar}>
            <Search size={20} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              cursorColor={Colors.primary.mint}
              selectionColor="transparent"
              underlineColorAndroid="transparent"
              outlineStyle="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XCircle size={20} color={Colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </LiqmahGlass>
        </View>

        {/* Category Filters */}
        {!categoriesLoading && categories.length > 0 && (
          <View style={styles.categoriesContainer}>
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

        {/* Recipes Grid */}
        <FlatList
          data={filteredRecipes}
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
              tintColor={Colors.primary.mint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search size={64} color={Colors.base.border.medium} />
              <LiqmahText variant="headline" weight="semiBold" color={Colors.text.secondary} style={styles.emptyText}>
                {searchQuery || selectedCategory
                  ? "No recipes found"
                  : "No recipes available"}
              </LiqmahText>
              <LiqmahText variant="body" color={Colors.text.tertiary} style={styles.emptySubtext}>
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "Check back later for new recipes"}
              </LiqmahText>
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
    paddingBottom: Layout.spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.md,
    height: 56,
    borderRadius: Layout.radius.input,
    gap: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
    borderWidth: 0,
    outlineStyle: 'none',
  },
  categoriesContainer: {
    paddingVertical: Layout.spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: Layout.radius.pill,
    backgroundColor: Colors.base.glass.light,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary.mint,
    borderColor: Colors.primary.mint,
  },
  recipesList: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Space for bottom dock
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
  },
});
