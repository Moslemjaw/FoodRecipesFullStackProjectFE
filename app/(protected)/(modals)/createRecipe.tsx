import { getAllCategories } from "@/api/categories";
import { getAllIngredients } from "@/api/ingredients";
import { createRecipe } from "@/api/recipes";
import Category from "@/types/Category";
import Ingredient from "@/types/Ingredient";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateRecipe() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedIngredients, setSelectedIngredients] = useState<
    { ingredientId: string; quantity: string; unit: string }[]
  >([]);
  {
    ingredientId: "";
    quantity: "";
    unit: "";
  }
  [] > [];
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
    mutationFn: () =>
      createRecipe(
        title,
        instructions,
        parseInt(cookingTime) || 0,
        selectedCategory,
        selectedIngredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: parseInt(ing.quantity) || 0,
          unit: ing.unit,
        })),
        image || undefined
      ),
    onSuccess: () => {
      Alert.alert("Success", "Recipe created successfully!");
      router.back();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to create recipe");
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("We need access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }
    mutate();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Recipe</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          style={[
            styles.submitButton,
            isPending && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {isPending ? "..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Recipe name"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Instructions */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="How to make this recipe..."
            placeholderTextColor="#9CA3AF"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Cooking Time */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cooking Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            placeholderTextColor="#9CA3AF"
            value={cookingTime}
            onChangeText={setCookingTime}
            keyboardType="numeric"
          />
        </View>

        {/* Category */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
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
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category._id &&
                      styles.categoryChipTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Ingredients */}
        <View style={styles.inputContainer}>
          <View style={styles.ingredientsHeader}>
            <Text style={styles.label}>Ingredients</Text>
            <TouchableOpacity onPress={addIngredient}>
              <Ionicons name="add-circle" size={28} color="#3B82F6" />
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
                      <Text
                        style={[
                          styles.ingredientChipText,
                          ing.ingredientId === ingredient._id &&
                            styles.ingredientChipTextSelected,
                        ]}
                      >
                        {ingredient.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.ingredientInputs}>
                <TextInput
                  style={styles.quantityInput}
                  placeholder="Qty"
                  placeholderTextColor="#9CA3AF"
                  value={ing.quantity}
                  onChangeText={(val) =>
                    updateIngredient(index, "quantity", val)
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.unitInput}
                  placeholder="Unit"
                  placeholderTextColor="#9CA3AF"
                  value={ing.unit}
                  onChangeText={(val) => updateIngredient(index, "unit", val)}
                />
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#9CA3AF",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: "#3B82F6",
  },
  categoryChipText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  ingredientsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ingredientRow: {
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  ingredientSelect: {
    marginBottom: 8,
  },
  ingredientChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    marginRight: 6,
  },
  ingredientChipSelected: {
    backgroundColor: "#22C55E",
  },
  ingredientChipText: {
    color: "#6B7280",
    fontSize: 12,
  },
  ingredientChipTextSelected: {
    color: "#FFFFFF",
  },
  ingredientInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  unitInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});
