import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import React, { useContext, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Tag, UserPlus, UserMinus, Users } from "lucide-react-native";
import AuthContext from "@/context/AuthContext";
import { getUserById, me } from "@/api/auth";
import { getRecipesByUserId } from "@/api/recipes";
import { getFollowing, getFollowers, followUser, unfollowUser } from "@/api/follows";
import { getImageUrl } from "@/utils/imageUtils";
import User from "@/types/User";
import Recipe from "@/types/Recipe";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahCard } from "@/components/Liqmah/LiqmahCard";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { Colors, Layout, Shadows } from "@/constants/LiqmahTheme";
import { Utensils } from "lucide-react-native";

export default function UserProfile() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAutheticated } = useContext(AuthContext);
  const userId = params.id;

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: me,
    enabled: isAutheticated,
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return getUserById(userId);
    },
    enabled: !!userId,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following"],
    queryFn: getFollowing,
    enabled: isAutheticated,
  });

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: getFollowers,
    enabled: !!userId && isAutheticated,
  });

  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    refetch: refetchRecipes,
    isRefetching: isRefetchingRecipes,
  } = useQuery({
    queryKey: ["userRecipes", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return getRecipesByUserId(userId);
    },
    enabled: !!userId,
  });

  const isFollowing = useMemo(() => {
    if (!isAutheticated || !userId || !following) return false;
    return following.some((follow: any) => {
      const followingId =
        typeof follow.followingID === "object"
          ? follow.followingID._id
          : follow.followingID;
      return followingId === userId;
    });
  }, [following, userId, isAutheticated]);

  const isOwnProfile = useMemo(() => {
    if (!isAutheticated || !currentUser || !userId) return false;
    return currentUser._id === userId;
  }, [currentUser, userId, isAutheticated]);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update follow status"
      );
    },
  });

  const handleFollow = () => {
    if (!isAutheticated) {
      Alert.alert(
        "Sign in Required",
        "Please sign in to follow users.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }
    followMutation.mutate();
  };

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
      <LiqmahCard
        variant="elevated"
        pressable
        onPress={() => handleRecipePress(item._id)}
        style={styles.recipeCard}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
        ) : (
          <View style={styles.recipeImagePlaceholder}>
            <Utensils size={32} color={Colors.text.tertiary} />
          </View>
        )}
        <View style={styles.recipeInfo}>
          <LiqmahText
            variant="body"
            weight="semiBold"
            style={styles.recipeTitle}
            numberOfLines={2}
          >
            {item.title}
          </LiqmahText>
          <View style={styles.recipeMeta}>
            {item.cookingTime && (
              <View style={styles.metaItem}>
                <Clock size={12} color={Colors.text.secondary} />
                <LiqmahText variant="micro" color={Colors.text.secondary}>
                  {item.cookingTime} min
                </LiqmahText>
              </View>
            )}
            <View style={styles.metaItem}>
              <Tag size={12} color={Colors.text.secondary} />
              <LiqmahText variant="micro" color={Colors.text.secondary}>
                {categoryName}
              </LiqmahText>
            </View>
          </View>
        </View>
      </LiqmahCard>
    );
  };

  if (!userId) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <LiqmahText variant="headline" color={Colors.text.secondary}>
            User ID is missing
          </LiqmahText>
          <LiqmahButton
            label="Go Back"
            variant="outline"
            onPress={() => router.back()}
            style={styles.retryButton}
          />
        </View>
      </LiqmahBackground>
    );
  }

  if (isLoadingUser) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.mint} />
          <LiqmahText style={styles.loadingText}>Loading profile...</LiqmahText>
        </View>
      </LiqmahBackground>
    );
  }

  if (!user) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <LiqmahText variant="headline" color={Colors.text.secondary}>
            User not found
          </LiqmahText>
          <LiqmahButton
            label="Go Back"
            variant="outline"
            onPress={() => router.back()}
            style={styles.retryButton}
          />
        </View>
      </LiqmahBackground>
    );
  }

  const userData = user as User;
  const followingCount = following.length;
  const followersCount = followers.length;

  return (
    <LiqmahBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <LiqmahCard variant="elevated" style={styles.backButtonCard}>
              <ArrowLeft size={20} color={Colors.text.primary} />
            </LiqmahCard>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingRecipes}
              onRefresh={refetchRecipes}
              tintColor={Colors.primary.mint}
            />
          }
        >
          <LiqmahCard variant="elevated" style={styles.profileHeader}>
            {userData?.image && getImageUrl(userData.image) ? (
              <Image
                source={{ uri: getImageUrl(userData.image)! }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <LiqmahText variant="display" color={Colors.base.white} weight="bold">
                  {userData?.name?.[0]?.toUpperCase() || "👤"}
                </LiqmahText>
              </View>
            )}
            <LiqmahText variant="section" weight="bold" style={styles.name}>
              {userData?.name || "User Profile"}
            </LiqmahText>
            <LiqmahText variant="body" color={Colors.text.secondary} style={styles.email}>
              {userData?.email || ""}
            </LiqmahText>

            {!isOwnProfile && isAutheticated && (
              <LiqmahButton
                label={isFollowing ? "Following" : "Follow"}
                variant={isFollowing ? "secondary" : "primary"}
                icon={
                  isFollowing ? (
                    <UserMinus size={18} color={Colors.text.primary} />
                  ) : (
                    <UserPlus size={18} color={Colors.base.white} />
                  )
                }
                onPress={handleFollow}
                loading={followMutation.isPending}
                style={styles.followButton}
              />
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <LiqmahText variant="headline" weight="bold" color={Colors.primary.mint}>
                  {recipes.length}
                </LiqmahText>
                <LiqmahText variant="caption" color={Colors.text.secondary}>
                  Recipes
                </LiqmahText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <LiqmahText variant="headline" weight="bold" color={Colors.primary.mint}>
                  {isLoadingFollowers ? "..." : followersCount}
                </LiqmahText>
                <View style={styles.statLabelRow}>
                  <Users size={12} color={Colors.text.secondary} />
                  <LiqmahText variant="caption" color={Colors.text.secondary}>
                    Followers
                  </LiqmahText>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <LiqmahText variant="headline" weight="bold" color={Colors.primary.mint}>
                  {followingCount}
                </LiqmahText>
                <LiqmahText variant="caption" color={Colors.text.secondary}>
                  Following
                </LiqmahText>
              </View>
            </View>
          </LiqmahCard>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LiqmahText variant="headline" weight="bold" style={styles.sectionTitle}>
                Recipes
              </LiqmahText>
              <LiqmahText variant="caption" color={Colors.text.secondary}>
                {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
              </LiqmahText>
            </View>

            {isLoadingRecipes ? (
              <View style={styles.loadingRecipesContainer}>
                <ActivityIndicator size="large" color={Colors.primary.mint} />
              </View>
            ) : recipes.length > 0 ? (
              <FlatList
                data={recipes}
                renderItem={renderRecipeCard}
                keyExtractor={(item) => item._id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.recipesList}
                columnWrapperStyle={styles.recipeRow}
              />
            ) : (
              <LiqmahCard variant="outlined" style={styles.emptyContainer}>
                <Utensils size={48} color={Colors.text.tertiary} />
                <LiqmahText
                  variant="body"
                  weight="semiBold"
                  color={Colors.text.secondary}
                  style={styles.emptyText}
                >
                  No recipes yet
                </LiqmahText>
                <LiqmahText
                  variant="caption"
                  color={Colors.text.tertiary}
                  style={styles.emptySubtext}
                >
                  This user hasn't created any recipes yet.
                </LiqmahText>
              </LiqmahCard>
            )}
          </View>
        </ScrollView>
      </View>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: Layout.spacing.md,
    paddingTop: 48,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  backButtonCard: {
    width: 44,
    height: 44,
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.xl,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    color: Colors.text.secondary,
  },
  retryButton: {
    marginTop: Layout.spacing.lg,
    minWidth: 150,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
    marginTop: 80,
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.mint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
    ...Shadows.floating,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Layout.spacing.md,
    borderWidth: 3,
    borderColor: Colors.base.white,
    ...Shadows.floating,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    marginBottom: Layout.spacing.md,
  },
  followButton: {
    width: "100%",
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.base.border.strong,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.base.border.strong,
    marginHorizontal: Layout.spacing.md,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    color: Colors.text.primary,
  },
  loadingRecipesContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  recipesList: {
    paddingBottom: 8,
  },
  recipeRow: {
    justifyContent: "space-between",
    marginBottom: Layout.spacing.md,
  },
  recipeCard: {
    width: "48%",
    padding: 0,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 140,
    backgroundColor: Colors.base.cloud,
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: 140,
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
    alignItems: "center",
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
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
