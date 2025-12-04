import { getAllCategories, createCategory } from "@/api/categories";
import { getAllIngredients, createIngredient, searchIngredients } from "@/api/ingredients";
import { updateRecipe, getRecipeById } from "@/api/recipes";
import Category from "@/types/Category";
import Ingredient from "@/types/Ingredient";
import Recipe from "@/types/Recipe";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

export default function EditRecipe() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    { ingredientId: string; quantity: string; unit: string; searchQuery?: string }[]
  >([]);
  const [error, setError] = useState<string>("");
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [ingredientSearchQueries, setIngredientSearchQueries] = useState<{ [key: number]: string }>({});

  // Fetch recipe data
  const { data: recipe, isLoading: isLoadingRecipe } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeById(recipeId!),
    enabled: !!recipeId,
  });

  // Update form when recipe data is loaded
  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title || "");
      setInstructions(
        Array.isArray(recipe.instructions)
          ? recipe.instructions.join("\n")
          : recipe.instructions || ""
      );
      setCookingTime(String(recipe.cookingTime || ""));
      
      // Set categories (handle array)
      if (Array.isArray(recipe.categoryId)) {
        const categoryIds = recipe.categoryId.map((cat: any) =>
          typeof cat === "object" ? cat._id : cat
        );
        setSelectedCategories(categoryIds);
      } else if (recipe.categoryId) {
        const categoryId =
          typeof recipe.categoryId === "string"
            ? recipe.categoryId
            : recipe.categoryId._id;
        setSelectedCategories(categoryId ? [categoryId] : []);
      } else {
        setSelectedCategories([]);
      }

      // Set image
      if (recipe.image) {
        const imageUrl = getImageUrl(recipe.image);
        setImage(imageUrl);
      }

      // Set ingredients
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        const formattedIngredients = recipe.ingredients.map((ing: any) => ({
          ingredientId:
            typeof ing.ingredientId === "object"
              ? ing.ingredientId._id
              : ing.ingredientId,
          quantity: String(ing.quantity || ""),
          unit: ing.unit || "",
        }));
        setSelectedIngredients(formattedIngredients);
      }
    }
  }, [recipe]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  // Fetch ingredients
  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getAllIngredients,
  });

  // Create ingredient mutation
  const createIngredientMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: (newIngredient) => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      return newIngredient;
    },
    onError: (err: any) => {
      console.error("Error creating ingredient:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to create ingredient";
      Alert.alert("Error", errorMsg);
    },
  });

  // Update recipe mutation
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

      if (selectedCategories.length === 0) {
        throw new Error("Please select at least one category");
      }

      return updateRecipe(
        recipeId!,
        title.trim(),
        instructions.trim(),
        parseInt(cookingTime) || 0,
        selectedCategories,
        validIngredients,
        isImageChanged ? image || undefined : undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["myRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
      Alert.alert("Success", "Recipe updated successfully!");
      router.back();
    },
    onError: (err: any) => {
      console.error("Recipe update error:", err);
      let errorMessage = "Failed to update recipe. Please try again.";

      // Extract error message
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          const typeErrorMatch = data.match(/TypeError: ([^<\n]+)/);
          if (typeErrorMatch) {
            errorMessage = `Backend Error: ${typeErrorMatch[1].trim()}`;
          } else {
            const errorMatch = data.match(/Error: ([^<\n]+)/);
            if (errorMatch) {
              errorMessage = errorMatch[1].trim();
            } else if (data.length < 200) {
              errorMessage = data;
            } else {
              errorMessage = "Backend error occurred. Check console for details.";
            }
          }
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
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
      setIsImageChanged(true);
    }
  };

  const addIngredient = () => {
    setSelectedIngredients([
      ...selectedIngredients,
      { ingredientId: "", quantity: "", unit: "", searchQuery: "" },
    ]);
  };

  const updateIngredient = (
    index: number,
    field: "ingredientId" | "quantity" | "unit" | "searchQuery",
    value: string
  ) => {
    const updated = [...selectedIngredients];
    updated[index][field] = value;
    setSelectedIngredients(updated);
    
    // Update search query state
    if (field === "searchQuery") {
      setIngredientSearchQueries({ ...ingredientSearchQueries, [index]: value });
    }
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    const newQueries = { ...ingredientSearchQueries };
    delete newQueries[index];
    setIngredientSearchQueries(newQueries);
  };

  const handleIngredientSearch = async (index: number, query: string) => {
    if (!query.trim()) {
      updateIngredient(index, "searchQuery", "");
      return;
    }

    updateIngredient(index, "searchQuery", query);
    
    try {
      const results = await searchIngredients(query);
      // If no results found, we'll show option to create
      if (results.length === 0 && query.trim().length > 0) {
        // Ingredient not found - will show create option in UI
      }
    } catch (error) {
      console.error("Error searching ingredients:", error);
    }
  };

  const handleCreateIngredient = async (index: number, name: string) => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter an ingredient name");
      return;
    }

    try {
      const newIngredient = await createIngredientMutation.mutateAsync(name.trim());
      // Update the ingredient in the list
      const updated = [...selectedIngredients];
      updated[index].ingredientId = newIngredient._id;
      // Keep the search query so user can continue typing to create more
      // Only clear if they want to select a different ingredient
      setSelectedIngredients(updated);
      
      // Don't clear search query - allow user to continue creating more ingredients
      // The create option will reappear if they type a new name that doesn't exist
      
      Alert.alert("Success", `Ingredient "${name}" created successfully!`);
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const handleSubmit = () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a recipe title");
      Alert.alert("Validation Error", "Please enter a recipe title");
      return;
    }
    if (!instructions.trim()) {
      setError("Please enter instructions");
      Alert.alert("Validation Error", "Please enter instructions");
      return;
    }
    if (!cookingTime || parseInt(cookingTime) <= 0) {
      setError("Please enter a valid cooking time (must be greater than 0)");
      Alert.alert("Validation Error", "Please enter a valid cooking time (must be greater than 0)");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Please select at least one category");
      Alert.alert("Validation Error", "Please select at least one category");
      return;
    }
    if (selectedIngredients.length === 0) {
      setError("Please add at least one ingredient");
      Alert.alert("Validation Error", "Please add at least one ingredient");
      return;
    }
    
    // Validate that all ingredients have required fields
    const invalidIngredients = selectedIngredients.filter(
      (ing) => !ing.ingredientId || !ing.quantity || !ing.unit
    );
    if (invalidIngredients.length > 0) {
      setError("Please fill in all ingredient fields (ingredient, quantity, and unit)");
      Alert.alert("Validation Error", "Please fill in all ingredient fields (ingredient, quantity, and unit)");
      return;
    }

    // Validate ingredient quantities
    const invalidQuantities = selectedIngredients.filter((ing) => {
      const qty = parseFloat(ing.quantity);
      return isNaN(qty) || qty <= 0;
    });
    if (invalidQuantities.length > 0) {
      setError("Please enter valid quantities (numbers greater than 0) for all ingredients");
      Alert.alert("Validation Error", "Please enter valid quantities (numbers greater than 0) for all ingredients");
      return;
    }

    // Check for ingredients with search queries but no selected ingredient
    const ingredientsWithSearchButNoSelection = selectedIngredients.filter(
      (ing) => ing.searchQuery && ing.searchQuery.trim() && !ing.ingredientId
    );
    if (ingredientsWithSearchButNoSelection.length > 0) {
      setError("Please select or create ingredients for all ingredient entries");
      Alert.alert("Validation Error", "Please select or create ingredients for all ingredient entries");
      return;
    }

    mutate();
  };

  if (isLoadingRecipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Recipe not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Recipe</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          style={[
            styles.submitButton,
            isPending && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {isPending ? "..." : "Save"}
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
              <Text style={styles.imagePlaceholderText}>Change Photo</Text>
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
            onChangeText={(text) => {
              // Only allow numbers
              const numericValue = text.replace(/[^0-9]/g, '');
              setCookingTime(numericValue);
            }}
            keyboardType="numeric"
          />
        </View>

        {/* Categories */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categories (Select Multiple)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories?.map((category: Category) => {
              const isSelected = selectedCategories.includes(category._id);
              return (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedCategories(
                        selectedCategories.filter((id) => id !== category._id)
                      );
                    } else {
                      setSelectedCategories([...selectedCategories, category._id]);
                    }
                  }}
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
            })}
          </ScrollView>
          {selectedCategories.length > 0 && (
            <Text style={styles.selectedCountText}>
              {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
            </Text>
          )}
        </View>

        {/* Ingredients */}
        <View style={styles.inputContainer}>
          <View style={styles.ingredientsHeader}>
            <Text style={styles.label}>Ingredients</Text>
            <TouchableOpacity onPress={addIngredient}>
              <Ionicons name="add-circle" size={28} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {selectedIngredients.map((ing, index) => {
            const searchQuery = ing.searchQuery || ingredientSearchQueries[index] || "";
            const filteredIngredients = searchQuery.trim()
              ? ingredients.filter((i) =>
                  i.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : ingredients;
            // Show create option if:
            // 1. There's a search query
            // 2. No ingredient with that exact name exists (case-insensitive)
            // 3. Either no ingredient is selected OR the search query doesn't match the selected ingredient's name
            const selectedIngredient = ing.ingredientId 
              ? ingredients.find((i) => i._id === ing.ingredientId)
              : null;
            const showCreateOption = searchQuery.trim() && 
              !ingredients.some((i) => i.name.toLowerCase() === searchQuery.toLowerCase().trim()) &&
              (!selectedIngredient || selectedIngredient.name.toLowerCase() !== searchQuery.toLowerCase().trim());

            return (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientSelect}>
                  <TextInput
                    style={styles.ingredientSearchInput}
                    placeholder="Search or type to create ingredient..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={(text) => {
                      updateIngredient(index, "searchQuery", text);
                      handleIngredientSearch(index, text);
                    }}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    style={styles.ingredientChipsScroll}
                  >
                    {filteredIngredients.map((ingredient: Ingredient) => (
                      <TouchableOpacity
                        key={ingredient._id}
                        style={[
                          styles.ingredientChip,
                          ing.ingredientId === ingredient._id &&
                            styles.ingredientChipSelected,
                        ]}
                        onPress={() => {
                          updateIngredient(index, "ingredientId", ingredient._id);
                          // Set search query to ingredient name so it shows what's selected
                          updateIngredient(index, "searchQuery", ingredient.name);
                        }}
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
                    {showCreateOption && (
                      <TouchableOpacity
                        style={styles.createIngredientChip}
                        onPress={() => handleCreateIngredient(index, searchQuery)}
                        disabled={createIngredientMutation.isPending}
                      >
                        <Ionicons name="add-circle" size={16} color="#3B82F6" />
                        <Text style={styles.createIngredientText}>
                          Create "{searchQuery}"
                        </Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              <View style={styles.ingredientInputs}>
                <TextInput
                  style={styles.quantityInput}
                  placeholder="Qty"
                  placeholderTextColor="#9CA3AF"
                  value={ing.quantity}
                  onChangeText={(val) => {
                    // Only allow numbers and decimal point
                    const numericValue = val.replace(/[^0-9.]/g, '');
                    // Prevent multiple decimal points
                    const parts = numericValue.split('.');
                    const formattedValue = parts.length > 2 
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : numericValue;
                    updateIngredient(index, "quantity", formattedValue);
                  }}
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
            );
          })}
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
  backButton: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryChipSelected: {
    backgroundColor: "#F3F4F6",
    borderColor: "#3B82F6",
    borderRadius: 24,
  },
  categoryChipText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#3B82F6",
    fontWeight: "600",
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
  ingredientSearchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  ingredientChipsScroll: {
    maxHeight: 100,
  },
  createIngredientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  createIngredientText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
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

