import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { deleteToken } from "@/api/storage";
import { me } from "@/api/auth";
import { getFollowing, getFollowers } from "@/api/follows";
import { getMyRecipes } from "@/api/recipes";
import { getImageUrl } from "@/utils/imageUtils";
import User from "@/types/User";
import Recipe from "@/types/Recipe";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahCard } from "@/components/Liqmah/LiqmahCard";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { Colors, Layout, Shadows } from "@/constants/LiqmahTheme";
import { Clock, Tag, Utensils, LogOut, Users, BookOpen } from "lucide-react-native";

export default function Profile() {
  const { setIsAutheticated } = useContext(AuthContext);
  const router = useRouter();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: me,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: following = [], isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following"],
    queryFn: getFollowing,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers"],
    queryFn: getFollowers,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    refetch: refetchRecipes,
    isRefetching: isRefetchingRecipes,
  } = useQuery({
    queryKey: ["myRecipes"],
    queryFn: getMyRecipes,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleLogout = async () => {
    await deleteToken();
    setIsAutheticated(false);
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

  const userData = user as User | undefined;
  const followingCount = following.length;
  const followersCount = followers.length;

  if (isLoadingUser && !user) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.fern} />
          <LiqmahText style={styles.loadingText}>Loading profile...</LiqmahText>
        </View>
      </LiqmahBackground>
    );
  }

  return (
    <LiqmahBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingRecipes}
            onRefresh={refetchRecipes}
            tintColor={Colors.primary.fern}
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

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {isLoadingRecipes ? (
                <ActivityIndicator size="small" color={Colors.primary.fern} />
              ) : (
                <LiqmahText variant="headline" weight="bold" color={Colors.primary.fern}>
                  {recipes.length}
                </LiqmahText>
              )}
              <View style={styles.statLabelRow}>
                <BookOpen size={14} color={Colors.text.secondary} />
                <LiqmahText variant="caption" color={Colors.text.secondary}>
                  Recipes
                </LiqmahText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {isLoadingFollowers ? (
                <ActivityIndicator size="small" color={Colors.primary.fern} />
              ) : (
                <LiqmahText variant="headline" weight="bold" color={Colors.primary.fern}>
                  {followersCount}
                </LiqmahText>
              )}
              <View style={styles.statLabelRow}>
                <Users size={14} color={Colors.text.secondary} />
                <LiqmahText variant="caption" color={Colors.text.secondary}>
                  Followers
                </LiqmahText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {isLoadingFollowing ? (
                <ActivityIndicator size="small" color={Colors.primary.fern} />
              ) : (
                <LiqmahText variant="headline" weight="bold" color={Colors.primary.fern}>
                  {followingCount}
                </LiqmahText>
              )}
              <View style={styles.statLabelRow}>
                <Users size={14} color={Colors.text.secondary} />
                <LiqmahText variant="caption" color={Colors.text.secondary}>
                  Following
                </LiqmahText>
              </View>
            </View>
          </View>
        </LiqmahCard>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LiqmahText variant="headline" weight="bold" style={styles.sectionTitle}>
              My Recipes
            </LiqmahText>
            <LiqmahText variant="caption" color={Colors.text.secondary}>
              {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
            </LiqmahText>
          </View>

          {isLoadingRecipes ? (
            <View style={styles.loadingRecipesContainer}>
              <ActivityIndicator size="large" color={Colors.primary.fern} />
            </View>
          ) : recipes.length > 0 ? (
            <FlatList
              data={recipes}
              renderItem={renderRecipeCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
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
                Share your culinary creations with the world!
              </LiqmahText>
              <LiqmahButton
                label="Create Recipe"
                onPress={() => router.push("/(tabs)/create" as any)}
                style={styles.createButton}
              />
            </LiqmahCard>
          )}
        </View>

        <View style={styles.section}>
          <LiqmahButton
            label="Logout"
            variant="outline"
            onPress={handleLogout}
            icon={<LogOut size={20} color={Colors.primary.fern} />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    color: Colors.text.secondary,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
    marginHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.fern,
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
    marginTop: 4,
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
    marginBottom: Layout.spacing.lg,
  },
  createButton: {
    width: "100%",
  },
  logoutButton: {
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
});
