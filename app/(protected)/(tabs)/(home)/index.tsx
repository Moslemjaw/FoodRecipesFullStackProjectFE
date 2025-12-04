import { getAllRecipes } from "@/api/recipes";
import { Heart, Bookmark, Share2, Clock, Tag, User, ChevronUp } from "lucide-react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { Colors, Layout, Typography } from "@/constants/LiqmahTheme";
import { getImageUrl } from "@/utils/imageUtils";
import Recipe from "@/types/Recipe";
import { LinearGradient } from "expo-linear-gradient";
import { Utensils } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, checkFavorite } from "@/api/favorites";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { Alert } from "react-native";

const { width, height } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAutheticated } = useContext(AuthContext);
  const flatListRef = useRef<FlatList>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: getAllRecipes,
  });

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return [...recipes].reverse(); // Show newest first
  }, [recipes]);

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
      <View style={styles.fullScreenItem}>
        {/* Background Image */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.backgroundImage} resizeMode="cover" />
        ) : (
          <View style={[styles.backgroundImage, styles.placeholderBackground]}>
            <Utensils size={80} color={Colors.text.tertiary} />
          </View>
        )}

        {/* Top Gradient Overlay */}
        <LinearGradient
          colors={Colors.gradients.topOverlay}
          style={styles.topOverlay}
          pointerEvents="none"
        />

        {/* Bottom Gradient Overlay */}
        <LinearGradient
          colors={Colors.gradients.bottomOverlay}
          style={styles.bottomOverlay}
          pointerEvents="none"
        />

        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              const newFavorite = !isFavorite;
              setFavoritesMap((prev) => ({ ...prev, [item._id]: newFavorite }));
              handleFavorite(item._id, isFavorite);
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={Colors.gradients.actionButton}
              style={styles.actionButtonGradient}
            >
              <Heart
                size={28}
                color={isFavorite ? "#EF4444" : "#FFFFFF"}
                fill={isFavorite ? "#EF4444" : "transparent"}
              />
            </LinearGradient>
            <LiqmahText variant="micro" color={Colors.text.overlay} style={styles.actionLabel}>
              {isFavorite ? "Liked" : "Like"}
            </LiqmahText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <LinearGradient
              colors={Colors.gradients.actionButton}
              style={styles.actionButtonGradient}
            >
              <Bookmark size={28} color="#FFFFFF" />
            </LinearGradient>
            <LiqmahText variant="micro" color={Colors.text.overlay} style={styles.actionLabel}>
              Save
            </LiqmahText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <LinearGradient
              colors={Colors.gradients.actionButton}
              style={styles.actionButtonGradient}
            >
              <Share2 size={28} color="#FFFFFF" />
            </LinearGradient>
            <LiqmahText variant="micro" color={Colors.text.overlay} style={styles.actionLabel}>
              Share
            </LiqmahText>
          </TouchableOpacity>
        </View>

        {/* Bottom Content Overlay */}
        <View style={styles.bottomContent}>
          <TouchableOpacity
            onPress={() => handleRecipePress(item._id)}
            activeOpacity={0.9}
            style={styles.contentTouchable}
          >
            {/* User Info */}
            <View style={styles.userRow}>
              <View style={styles.userAvatar}>
                <User size={16} color={Colors.text.overlay} />
              </View>
              <LiqmahText
                variant="caption"
                weight="semiBold"
                color={Colors.text.overlay}
                style={styles.userName}
              >
                {userName}
              </LiqmahText>
            </View>

            {/* Title */}
            <LiqmahText
              variant="display"
              weight="extraBold"
              color={Colors.text.overlay}
              style={styles.recipeTitle}
              numberOfLines={2}
            >
              {item.title}
            </LiqmahText>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Clock size={14} color={Colors.text.overlay} />
                <LiqmahText variant="caption" color={Colors.text.overlay} style={styles.metaText}>
                  {item.cookingTime} min
                </LiqmahText>
              </View>
              <View style={styles.metaChip}>
                <Tag size={14} color={Colors.text.overlay} />
                <LiqmahText variant="caption" color={Colors.text.overlay} style={styles.metaText}>
                  {categoryName}
                </LiqmahText>
              </View>
            </View>

            {/* Tap to view indicator */}
            <View style={styles.tapIndicator}>
              <ChevronUp size={20} color={Colors.text.overlaySecondary} />
              <LiqmahText variant="micro" color={Colors.text.overlaySecondary}>
                Tap to view recipe
              </LiqmahText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoadingRecipes) {
    return (
      <LiqmahBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.mint} />
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
        <FlatList
          ref={flatListRef}
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item._id}
          pagingEnabled={true}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          bounces={false}
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
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
  },
  emptyText: {
    marginTop: Layout.spacing.lg,
    textAlign: "center",
  },
  fullScreenItem: {
    width: width,
    height: height,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  placeholderBackground: {
    backgroundColor: Colors.base.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  rightActions: {
    position: "absolute",
    right: Layout.spacing.lg,
    bottom: 200,
    alignItems: "center",
    gap: Layout.spacing.lg,
    zIndex: 10,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  actionLabel: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.xl,
    paddingBottom: 100, // Space for nav bar
    zIndex: 10,
  },
  contentTouchable: {
    width: "100%",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userName: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  recipeTitle: {
    marginBottom: Layout.spacing.md,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    lineHeight: 56,
  },
  metaRow: {
    flexDirection: "row",
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  metaText: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tapIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Layout.spacing.sm,
  },
});
