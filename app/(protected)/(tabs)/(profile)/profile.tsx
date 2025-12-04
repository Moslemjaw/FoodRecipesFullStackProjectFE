import { me } from "@/api/auth";
import { getAllCategories } from "@/api/categories";
import { getFollowers, getFollowing } from "@/api/follows";
import { getAllIngredients } from "@/api/ingredients";
import { getRecipeRatings } from "@/api/ratings";
import { getMyRecipes } from "@/api/recipes";
import { deleteToken } from "@/api/storage";
import AuthContext from "@/context/AuthContext";
import Recipe from "@/types/Recipe";
import { getImageUrl } from "@/utils/imageUtils";
import { formatCookingTime } from "@/utils/timeUtils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { setIsAutheticated } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null
  );

  // Fetch current user data (priority - show this first)
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: me,
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch user's recipes (priority - show this early)
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery({
    queryKey: ["myRecipes"],
    queryFn: getMyRecipes,
    staleTime: 30000,
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  // Fetch ingredients for filtering
  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getAllIngredients,
  });

  // Fetch followers (lower priority - can load in background)
  const { data: followers = [] } = useQuery({
    queryKey: ["followers"],
    queryFn: getFollowers,
    staleTime: 60000, // Cache longer
    retry: 1, // Only retry once
    retryDelay: 1000,
  });

  // Fetch following (lower priority - can load in background)
  const { data: following = [] } = useQuery({
    queryKey: ["following"],
    queryFn: getFollowing,
    staleTime: 60000,
    retry: 1,
    retryDelay: 1000,
  });

  const handleLogout = async () => {
    console.log("handleLogout called");

    const performLogout = async () => {
      console.log("Logout confirmed - deleting token...");
      try {
        await deleteToken();
        console.log("Token deleted - setting auth to false...");
        setIsAutheticated(false);
        console.log("Auth set to false - navigating to login...");
        router.replace("/(auth)/login" as any);
      } catch (error) {
        console.error("Error during logout:", error);
        Alert.alert("Error", "Failed to logout. Please try again.");
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        await performLogout();
      } else {
        console.log("User cancelled logout (web)");
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            console.log("User cancelled logout");
          },
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout,
        },
      ]);
    }
  };

  // Filter recipes based on selected filters
  const filteredRecipes = useMemo(() => {
    let filtered = [...recipes];

    // Filter by category
    if (selectedCategory) {
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

    // Filter by ingredient
    if (selectedIngredient) {
      filtered = filtered.filter((recipe) => {
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
          return false;
        }
        return recipe.ingredients.some((ing: any) => {
          const ingId =
            typeof ing.ingredientId === "object"
              ? ing.ingredientId._id
              : ing.ingredientId;
          return ingId === selectedIngredient;
        });
      });
    }

    return filtered;
  }, [recipes, selectedCategory, selectedIngredient]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/(protected)/recipe/${recipeId}` as any);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const imageUrl = getImageUrl(item.image);
    return (
      <TouchableOpacity
        style={styles.recipeGridItemInner}
        onPress={() => handleRecipePress(item._id)}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.recipeGridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.recipeGridPlaceholder}>
            <Text style={styles.recipeGridPlaceholderText}>
              {item.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {/* Recipe Details Overlay */}
        <View style={styles.recipeOverlay}>
          <Text style={styles.recipeTitleOverlay} numberOfLines={1}>
            {item.title}
          </Text>
          {item.cookingTime && (
            <View style={styles.recipeTimeOverlay}>
              <Ionicons name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.recipeTimeText}>
                {formatCookingTime(item.cookingTime)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const userImageUrl = getImageUrl(currentUser?.image);
  const followersCount = Array.isArray(followers) ? followers.length : 0;
  const followingCount = Array.isArray(following) ? following.length : 0;
  const recipesCount = recipes.length;

  // Fetch ratings for all recipes to calculate average
  const recipeIds = recipes.map((r) => r._id);
  const { data: allRatingsData } = useQuery({
    queryKey: ["allRecipeRatings", recipeIds],
    queryFn: async () => {
      if (recipeIds.length === 0) return [];
      const ratingsPromises = recipeIds.map((id) =>
        getRecipeRatings(id).catch(() => ({
          averageRating: 0,
          totalRatings: 0,
        }))
      );
      return Promise.all(ratingsPromises);
    },
    enabled: recipeIds.length > 0,
  });

  const calculatedAverageRating = useMemo(() => {
    if (!allRatingsData || allRatingsData.length === 0) return null;
    const validRatings = allRatingsData.filter(
      (r: any) => r && r.averageRating > 0
    );
    if (validRatings.length === 0) return null;
    const sum = validRatings.reduce(
      (acc: number, r: any) => acc + r.averageRating,
      0
    );
    return sum / validRatings.length;
  }, [allRatingsData]);

  // Show minimal loading only for critical user data
  if (isLoadingUser && !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Logout Button - Floating */}
      <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {userImageUrl ? (
            <Image source={{ uri: userImageUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{recipesCount}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          {calculatedAverageRating !== null && (
            <View style={styles.statItem}>
              <View style={styles.ratingStatContainer}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={styles.statNumber}>
                  {calculatedAverageRating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          )}
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {currentUser?.name || (currentUser as any)?.user?.name || "User"}
        </Text>
        <Text style={styles.userEmail}>
          {currentUser?.email || (currentUser as any)?.user?.email || ""}
        </Text>
      </View>

      {/* Recipes Grid */}
      <View style={styles.recipesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recipes</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name={showFilters ? "filter" : "filter-outline"}
              size={20}
              color={
                showFilters || selectedCategory || selectedIngredient
                  ? "#3B82F6"
                  : "#6B7280"
              }
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category:</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedCategory && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !selectedCategory && styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.filterChip,
                      selectedCategory === category._id &&
                        styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setSelectedCategory(
                        selectedCategory === category._id ? null : category._id
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === category._id &&
                          styles.filterChipTextActive,
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
              <Text style={styles.filterLabel}>Ingredient:</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedIngredient && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedIngredient(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !selectedIngredient && styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {ingredients.slice(0, 10).map((ingredient) => (
                  <TouchableOpacity
                    key={ingredient._id}
                    style={[
                      styles.filterChip,
                      selectedIngredient === ingredient._id &&
                        styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setSelectedIngredient(
                        selectedIngredient === ingredient._id
                          ? null
                          : ingredient._id
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedIngredient === ingredient._id &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {ingredient.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {isLoadingRecipes ? (
          <View style={styles.loadingRecipesContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : filteredRecipes.length > 0 ? (
          <View style={styles.recipesGrid}>
            {filteredRecipes.map((recipe) => (
              <View key={recipe._id} style={styles.recipeGridItem}>
                {renderRecipeItem({ item: recipe })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyRecipesContainer}>
            <Text style={styles.emptyRecipesText}>
              {selectedCategory || selectedIngredient
                ? "No recipes match your filters"
                : "No recipes yet"}
            </Text>
            {!selectedCategory && !selectedIngredient && (
              <TouchableOpacity
                style={styles.createRecipeButton}
                onPress={() =>
                  router.push("/(protected)/(modals)/createRecipe")
                }
              >
                <Text style={styles.createRecipeButtonText}>Create Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logoutIconButton: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 1000,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileImageContainer: {
    marginRight: 32,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  ratingStatContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userInfo: {
    padding: 20,
    paddingBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  recipesSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  recipeGridItemWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  loadingRecipesContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  recipesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -1,
  },
  recipeGridItem: {
    width: "33.333%",
    aspectRatio: 1,
    padding: 1,
  },
  recipeGridItemInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  recipeGridImage: {
    width: "100%",
    height: "100%",
  },
  recipeGridPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  recipeGridPlaceholderText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  recipeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    paddingHorizontal: 10,
  },
  recipeTitleOverlay: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  recipeTimeOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeTimeText: {
    fontSize: 11,
    color: "#FFFFFF",
  },
  emptyRecipesContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyRecipesText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  createRecipeButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createRecipeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
