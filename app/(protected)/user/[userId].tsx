import { me } from "@/api/auth";
import { followUser, getFollowing, unfollowUser } from "@/api/follows";
import { getRecipeRatings } from "@/api/ratings";
import { getUserById, getUserRecipes } from "@/api/users";
import Recipe from "@/types/Recipe";
import User from "@/types/User";
import { getImageUrl } from "@/utils/imageUtils";
import { formatCookingTime } from "@/utils/timeUtils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserProfile() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Safe navigation helper - goes back if possible, otherwise goes to home
  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)/(home)/" as any);
    }
  };

  // Get current user to check if viewing own profile
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: me,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch user's recipes
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery<
    Recipe[]
  >({
    queryKey: ["userRecipes", userId],
    queryFn: () => getUserRecipes(userId!),
    enabled: !!userId,
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch current user's following list to check if following this user
  const { data: following = [] } = useQuery<any[]>({
    queryKey: ["following"],
    queryFn: getFollowing,
    retry: 1,
    retryDelay: 1000,
  });

  // Check if current user is following this user
  const [isFollowingState, setIsFollowingState] = React.useState(false);

  // Initialize following state from query data
  React.useEffect(() => {
    if (userId && following) {
      const followingStatus = following.some((follow: any) => {
        const followingId =
          typeof follow.followingID === "object"
            ? follow.followingID._id
            : follow.followingID;
        return followingId === userId;
      });
      setIsFollowingState(followingStatus);
    }
  }, [following, userId]);

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const currentStatus = isFollowingState;
      const newStatus = !currentStatus;

      // Optimistic update
      setIsFollowingState(newStatus);

      try {
        if (currentStatus) {
          await unfollowUser(targetUserId);
        } else {
          await followUser(targetUserId);
        }
      } catch (err) {
        // Revert optimistic update on error
        setIsFollowingState(currentStatus);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const handleFollow = () => {
    if (userId) {
      followMutation.mutate(userId);
    }
  };

  // Fetch ratings for all recipes to calculate average - MUST be before early returns
  const recipeIds = recipes.map((r) => r._id);
  const { data: allRatingsData } = useQuery({
    queryKey: ["allRecipeRatings", userId, recipeIds],
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

  const handleRecipePress = (recipeId: string) => {
    // Use replace to prevent route stacking
    router.replace(`/(protected)/recipe/${recipeId}` as any);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const imageUrl = getImageUrl(item.image);
    return (
      <TouchableOpacity
        style={styles.recipeGridItem}
        onPress={() => handleRecipePress(item._id)}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.recipeGridImage} />
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

  if (isLoadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleSafeBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userImageUrl = getImageUrl(user.image);
  const isOwnProfile = currentUser?._id === userId;
  const recipesCount = recipes.length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: user.name || "Profile",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#111827",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 0, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {userImageUrl ? (
              <Image
                source={{ uri: userImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
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

        {/* User Info and Follow Button */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || "User"}</Text>
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowingState && styles.followButtonActive,
              ]}
              onPress={handleFollow}
              disabled={followMutation.isPending}
            >
              <Text
                style={[
                  styles.followButtonText,
                  isFollowingState && styles.followButtonTextActive,
                ]}
              >
                {isFollowingState ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recipes Grid */}
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>Recipes</Text>
          {isLoadingRecipes ? (
            <View style={styles.loadingRecipesContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : recipes.length > 0 ? (
            <View style={styles.recipesGrid}>
              {recipes.map((recipe) => (
                <View key={recipe._id} style={styles.recipeGridItemWrapper}>
                  {renderRecipeItem({ item: recipe })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRecipesContainer}>
              <Text style={styles.emptyRecipesText}>No recipes yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 16,
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
    marginBottom: 12,
  },
  followButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
  },
  followButtonActive: {
    backgroundColor: "#E5E7EB",
  },
  followButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  followButtonTextActive: {
    color: "#111827",
  },
  recipesSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
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
  recipeGridItemWrapper: {
    width: "33.333%",
    aspectRatio: 1,
    padding: 1,
  },
  recipeGridItem: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    position: "relative",
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
  },
});
