import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/api/categories";

export default function CreateCategory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => createCategory(name.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      Alert.alert("Success", "Category created successfully!");
      router.back();
    },
    onError: (err: any) => {
      console.error("Category creation error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create category. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter a category name");
      return;
    }

    mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Category</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          style={[
            styles.submitButton,
            isPending && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {isPending ? "..." : "Create"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Italian, Dessert, Breakfast..."
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6B7280"
          />
          <Text style={styles.infoText}>
            Add a new category to organize your recipes
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
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
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});
