import { getAllCategories } from "@/api/categories";
import { getAllIngredients } from "@/api/ingredients";
import { createRecipe } from "@/api/recipes";
import Category from "@/types/Category";
import Ingredient from "@/types/Ingredient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahGlass } from "@/components/Liqmah/LiqmahGlass";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { LiqmahInput } from "@/components/Liqmah/LiqmahInput";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { Colors, Layout, Shadows, Typography } from "@/constants/LiqmahTheme";
import { X, Camera, Plus, Trash2, Clock, AlignLeft, Type } from "lucide-react-native";

export default function CreateRecipe() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedIngredients, setSelectedIngredients] = useState<
    { ingredientId: string; quantity: string; unit: string }[]
  >([]);
  const [error, setError] = useState<string>("");

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  // Fetch ingredients
  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getAllIngredients,
  });

  // Create recipe mutation
  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const validIngredients = selectedIngredients
        .filter((ing) => ing.ingredientId && ing.quantity && ing.unit)
        .map((ing) => {
          const quantity = parseFloat(ing.quantity);
          if (isNaN(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity for ingredient: ${ing.quantity}`);
          }
          return {
            ingredientId: ing.ingredientId,
            quantity: quantity,
            unit: ing.unit.trim(),
          };
        });

      return createRecipe(
        title.trim(),
        instructions.trim(),
        parseInt(cookingTime) || 0,
        selectedCategory,
        validIngredients,
        image || undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      Alert.alert("Success", "Recipe created successfully!");
      router.back();
    },
    onError: (err: any) => {
      console.error("Recipe creation error:", err);
      let errorMessage = "Failed to create recipe. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("We need access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    setSelectedIngredients([
      ...selectedIngredients,
      { ingredientId: "", quantity: "", unit: "" },
    ]);
  };

  const updateIngredient = (
    index: number,
    field: "ingredientId" | "quantity" | "unit",
    value: string
  ) => {
    const updated = [...selectedIngredients];
    updated[index][field] = value;
    setSelectedIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a recipe title");
      return;
    }
    if (!instructions.trim()) {
      setError("Please enter instructions");
      return;
    }
    if (!cookingTime || parseInt(cookingTime) <= 0) {
      setError("Please enter a valid cooking time");
      return;
    }
    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }
    if (selectedIngredients.length === 0) {
      setError("Please add at least one ingredient");
      return;
    }
    // Validate that all ingredients have required fields
    const invalidIngredients = selectedIngredients.filter(
      (ing) => !ing.ingredientId || !ing.quantity || !ing.unit
    );
    if (invalidIngredients.length > 0) {
      setError("Please fill in all ingredient fields");
      return;
    }

    mutate();
  };

  return (
    <LiqmahBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <X size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <LiqmahText variant="headline" weight="bold">Create Recipe</LiqmahText>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            style={[
              styles.submitButton,
              isPending && styles.submitButtonDisabled,
            ]}
          >
            <LiqmahText weight="semiBold" color={Colors.base.white}>
              {isPending ? "..." : "Post"}
            </LiqmahText>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <LiqmahText style={styles.errorText} color="#DC2626">{error}</LiqmahText>
          </View>
        ) : null}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LiqmahGlass intensity={60} style={styles.formCard}>
            {/* Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={40} color={Colors.text.tertiary} />
                  <LiqmahText style={styles.imagePlaceholderText} color={Colors.text.secondary}>Add Photo</LiqmahText>
                </View>
              )}
            </TouchableOpacity>

            {/* Basic Info */}
            <LiqmahInput
              label="Title"
              placeholder="Recipe name"
              value={title}
              onChangeText={setTitle}
              icon={<Type size={20} color={Colors.text.tertiary} />}
            />

            <LiqmahInput
              label="Cooking Time (minutes)"
              placeholder="30"
              value={cookingTime}
              onChangeText={setCookingTime}
              keyboardType="numeric"
              icon={<Clock size={20} color={Colors.text.tertiary} />}
            />

            {/* Category */}
            <View style={styles.inputGroup}>
              <LiqmahText style={styles.label} weight="medium" variant="caption">Category</LiqmahText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories?.map((category: Category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category._id &&
                        styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(category._id)}
                  >
                    <LiqmahText
                      variant="caption"
                      color={selectedCategory === category._id ? Colors.base.white : Colors.text.secondary}
                      weight={selectedCategory === category._id ? "medium" : "regular"}
                    >
                      {category.name}
                    </LiqmahText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Ingredients */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <LiqmahText style={styles.label} weight="medium" variant="caption">Ingredients</LiqmahText>
                <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
                  <Plus size={20} color={Colors.primary.mint} />
                  <LiqmahText variant="caption" color={Colors.primary.mint} weight="semiBold">Add</LiqmahText>
                </TouchableOpacity>
              </View>

              {selectedIngredients.map((ing, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.ingredientSelect}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled
                    >
                      {ingredients?.map((ingredient: Ingredient) => (
                        <TouchableOpacity
                          key={ingredient._id}
                          style={[
                            styles.ingredientChip,
                            ing.ingredientId === ingredient._id &&
                              styles.ingredientChipSelected,
                          ]}
                          onPress={() =>
                            updateIngredient(index, "ingredientId", ingredient._id)
                          }
                        >
                          <LiqmahText
                            variant="micro"
                            color={ing.ingredientId === ingredient._id ? Colors.base.white : Colors.text.secondary}
                          >
                            {ingredient.name}
                          </LiqmahText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.ingredientInputs}>
                    <TextInput
                      style={styles.quantityInput}
                      placeholder="Qty"
                      placeholderTextColor={Colors.text.tertiary}
                      value={ing.quantity}
                      onChangeText={(val) =>
                        updateIngredient(index, "quantity", val)
                      }
                      keyboardType="numeric"
                      cursorColor={Colors.primary.mint}
                      selectionColor="transparent"
                      underlineColorAndroid="transparent"
                      outlineStyle="none"
                    />
                    <TextInput
                      style={styles.unitInput}
                      placeholder="Unit"
                      placeholderTextColor={Colors.text.tertiary}
                      value={ing.unit}
                      onChangeText={(val) => updateIngredient(index, "unit", val)}
                      cursorColor={Colors.primary.mint}
                      selectionColor="transparent"
                      underlineColorAndroid="transparent"
                      outlineStyle="none"
                    />
                    <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Instructions */}
            <View style={styles.inputGroup}>
              <LiqmahText style={styles.label} weight="medium" variant="caption">Instructions</LiqmahText>
              <TextInput
                style={[styles.textArea]}
                placeholder="How to make this recipe..."
                placeholderTextColor={Colors.text.tertiary}
                value={instructions}
                onChangeText={setInstructions}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                cursorColor={Colors.primary.mint}
                selectionColor="transparent"
                underlineColorAndroid="transparent"
                outlineStyle="none"
              />
            </View>
          </LiqmahGlass>
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 60,
    paddingBottom: Layout.spacing.md,
  },
  iconButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary.mint,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Layout.radius.pill,
    ...Shadows.button.mint,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: "rgba(254, 226, 226, 0.5)",
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  formCard: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.radius.card,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: Layout.radius.card,
    overflow: "hidden",
    marginBottom: Layout.spacing.lg,
    backgroundColor: Colors.base.cloud,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
  },
  label: {
    color: Colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: Colors.base.glass.light,
    borderWidth: 1,
    borderColor: Colors.base.border.medium,
    borderRadius: Layout.radius.input,
    padding: 16,
    height: 120,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: Colors.text.primary,
    outlineStyle: 'none',
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.base.glass.light,
    borderRadius: Layout.radius.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary.mint,
    borderColor: Colors.primary.mint,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ingredientRow: {
    marginBottom: 12,
    backgroundColor: Colors.base.glass.light,
    borderRadius: Layout.radius.button,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
  },
  ingredientSelect: {
    marginBottom: 8,
  },
  ingredientChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.base.cloud,
    borderRadius: Layout.radius.pill,
    marginRight: 6,
  },
  ingredientChipSelected: {
    backgroundColor: Colors.primary.mint,
  },
  ingredientInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: Colors.base.white,
    borderWidth: 1,
    borderColor: Colors.base.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    outlineStyle: 'none',
  },
  unitInput: {
    flex: 1,
    backgroundColor: Colors.base.white,
    borderWidth: 1,
    borderColor: Colors.base.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    outlineStyle: 'none',
  },
  removeButton: {
    padding: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
