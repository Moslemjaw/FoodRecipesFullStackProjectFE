import { getAllCategories } from "@/api/categories";
import { getAllIngredients } from "@/api/ingredients";
import {
  filterByIngredients,
  getAllRecipes,
  getFeedRecipes,
} from "@/api/recipes";
import Category from "@/types/Category";
import Recipe from "@/types/Recipe";
import { getImageUrl } from "@/utils/imageUtils";
import { formatCookingTime } from "@/utils/timeUtils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SortBy = "none" | "alphabetical" | "time";
type SortDirection = "asc" | "desc";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("none");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showFeed, setShowFeed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const router = useRouter();

  const {
    data: allRecipes = [],
    isLoading: isLoadingAll,
    refetch: refetchAll,
    isRefetching: isRefetchingAll,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const data = await getAllRecipes();
      return data;
    },
  });

  const {
    data: feedRecipes = [],
    isLoading: isLoadingFeed,
    refetch: refetchFeed,
    isRefetching: isRefetchingFeed,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: getFeedRecipes,
    enabled: showFeed,
  });

  const recipes = showFeed ? feedRecipes : allRecipes;
  const isLoading = showFeed ? isLoadingFeed : isLoadingAll;
  const isRefetching = showFeed ? isRefetchingFeed : isRefetchingAll;
  const refetch = showFeed ? refetchFeed : refetchAll;

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getAllIngredients,
  });

  // Fetch filtered recipes by ingredients if any selected
  const { data: ingredientFilteredRecipes = [] } = useQuery({
    queryKey: ["recipesByIngredients", selectedIngredients],
    queryFn: () => filterByIngredients(selectedIngredients),
    enabled: selectedIngredients.length > 0 && !showFeed,
  });

  const filteredRecipes = useMemo(() => {
    // Use ingredient-filtered recipes if ingredients are selected
    let filtered =
      selectedIngredients.length > 0 && !showFeed
        ? [...ingredientFilteredRecipes]
        : [...recipes];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
      );
    }

    // Filter by category (only in explore mode, not feed)
    if (!showFeed && selectedCategory) {
      filtered = filtered.filter((recipe) => {
        const categoryId =
          typeof recipe.categoryId === "string"
            ? recipe.categoryId
            : Array.isArray(recipe.categoryId)
            ? recipe.categoryId[0]?._id || recipe.categoryId[0]
            : recipe.categoryId?._id;
        return categoryId === selectedCategory;
      });
    }

    // Apply sorting (only in explore mode, feed is already sorted by most recent)
    if (!showFeed && sortBy !== "none") {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        if (sortBy === "alphabetical") {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === "time") {
          const timeA = a.cookingTime || 0;
          const timeB = b.cookingTime || 0;
          comparison = timeA - timeB;
        }

        return sortDirection === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [
    recipes,
    ingredientFilteredRecipes,
    selectedIngredients,
    searchQuery,
    selectedCategory,
    sortBy,
    sortDirection,
    showFeed,
  ]);

  const handleRecipePress = (recipeId: string) => {
    router.replace(`/(protected)/recipe/${recipeId}` as any);
  };

  const getCategories = (recipe: Recipe) => {
    const categories: Array<{ _id: string; name: string }> = [];

    if (Array.isArray(recipe.categoryId) && recipe.categoryId.length > 0) {
      recipe.categoryId.forEach((cat: any) => {
        if (typeof cat === "object" && cat.name && cat._id) {
          if (!categories.some((c) => c._id === cat._id)) {
            categories.push({ _id: cat._id, name: cat.name });
          }
        }
      });
    } else if (
      recipe.categoryId &&
      typeof recipe.categoryId === "object" &&
      "name" in recipe.categoryId
    ) {
      const cat = recipe.categoryId as any;
      if (cat._id && cat.name) {
        categories.push({ _id: cat._id, name: cat.name });
      }
    }

    return categories.length > 0
      ? categories
      : [{ _id: "", name: "Uncategorized" }];
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const categories = getCategories(item);
    const imageUrl = getImageUrl(item.image);

    // Debug logging
    if (item.image) {
      console.log(`Recipe "${item.title}" - Original image:`, item.image);
      console.log(`Recipe "${item.title}" - Processed image URL:`, imageUrl);
    }

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item._id)}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.recipeImage}
            onError={(error) => {
              console.error(
                `Image load error for recipe "${item.title}":`,
                error.nativeEvent.error
              );
              console.error(`Failed URL:`, imageUrl);
            }}
            onLoad={() => {
              console.log(
                `Image loaded successfully for recipe "${item.title}"`
              );
            }}
          />
        ) : (
          <View style={styles.recipeImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.recipeMeta}>
            {item.cookingTime && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {formatCookingTime(item.cookingTime)}
                </Text>
              </View>
            )}
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <View key={cat._id} style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{cat.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = (category: Category) => {
    const isSelected = selectedCategory === category._id;
    return (
      <TouchableOpacity
        key={category._id}
        style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
        onPress={() => setSelectedCategory(isSelected ? null : category._id)}
      >
        <Text
          style={[
            styles.categoryChipText,
            isSelected && styles.categoryChipTextSelected,
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar and Feed Button */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.feedButton, showFeed && styles.feedButtonActive]}
          onPress={() => setShowFeed(!showFeed)}
        >
          <Ionicons
            name={showFeed ? "newspaper" : "newspaper-outline"}
            size={20}
            color={showFeed ? "#FFFFFF" : "#3B82F6"}
          />
          <Text
            style={[
              styles.feedButtonText,
              showFeed && styles.feedButtonTextActive,
            ]}
          >
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterToggleButton,
            showFilters && styles.filterToggleButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "filter" : "filter-outline"}
            size={20}
            color={
              showFilters || selectedIngredients.length > 0
                ? "#FFFFFF"
                : "#3B82F6"
            }
          />
        </TouchableOpacity>
      </View>

      {/* Filters (Category and Ingredients) */}
      {showFilters && !showFeed && (
        <View style={styles.ingredientFiltersContainer}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.ingredientFiltersTitle}>
              Filter by Category:
            </Text>
            <View style={styles.ingredientChipsContainer}>
              <TouchableOpacity
                style={[
                  styles.ingredientChip,
                  !selectedCategory && styles.ingredientChipSelected,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.ingredientChipText,
                    !selectedCategory && styles.ingredientChipTextSelected,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.ingredientChip,
                    selectedCategory === category._id &&
                      styles.ingredientChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category._id ? null : category._id
                    )
                  }
                >
                  <Text
                    style={[
                      styles.ingredientChipText,
                      selectedCategory === category._id &&
                        styles.ingredientChipTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredient Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.ingredientFiltersTitle}>
              Filter by Ingredients:
            </Text>
            <View style={styles.ingredientChipsContainer}>
              {ingredients.map((ingredient) => {
                const isSelected = selectedIngredients.includes(ingredient._id);
                return (
                  <TouchableOpacity
                    key={ingredient._id}
                    style={[
                      styles.ingredientChip,
                      isSelected && styles.ingredientChipSelected,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedIngredients(
                          selectedIngredients.filter(
                            (id) => id !== ingredient._id
                          )
                        );
                      } else {
                        setSelectedIngredients([
                          ...selectedIngredients,
                          ingredient._id,
                        ]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.ingredientChipText,
                        isSelected && styles.ingredientChipTextSelected,
                      ]}
                    >
                      {ingredient.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedIngredients.length > 0 && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => setSelectedIngredients([])}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[
                styles.sortChip,
                sortBy === "alphabetical" && styles.sortChipSelected,
              ]}
              onPress={() =>
                setSortBy(sortBy === "alphabetical" ? "none" : "alphabetical")
              }
            >
              <Ionicons
                name="text-outline"
                size={14}
                color={sortBy === "alphabetical" ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === "alphabetical" && styles.sortChipTextSelected,
                ]}
              >
                A-Z
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortChip,
                sortBy === "time" && styles.sortChipSelected,
              ]}
              onPress={() => setSortBy(sortBy === "time" ? "none" : "time")}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={sortBy === "time" ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === "time" && styles.sortChipTextSelected,
                ]}
              >
                Time
              </Text>
            </TouchableOpacity>
          </View>
          {sortBy !== "none" && (
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              <Ionicons
                name={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
                size={18}
                color="#3B82F6"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recipes Grid */}
      <FlatList
        data={filteredRecipes}
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
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? "No recipes found"
                : "No recipes available"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory
                ? "Try adjusting your search or filters"
                : "Check back later for new recipes"}
            </Text>
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
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  sortContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  sortOptions: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  sortChipTextSelected: {
    color: "#FFFFFF",
  },
  directionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  feedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  feedButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  feedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  feedButtonTextActive: {
    color: "#FFFFFF",
  },
  filterToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterToggleButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  ingredientFiltersContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  ingredientFiltersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  ingredientChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  ingredientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ingredientChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  ingredientChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  ingredientChipTextSelected: {
    color: "#FFFFFF",
  },
  clearFiltersButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#EF4444",
  },
  categoriesContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
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
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center",
  },
  categoryPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  categoryPillText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "500",
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
  },
});
