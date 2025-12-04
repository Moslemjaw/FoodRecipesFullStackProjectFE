import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIngredient } from "@/api/ingredients";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahGlass } from "@/components/Liqmah/LiqmahGlass";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { LiqmahInput } from "@/components/Liqmah/LiqmahInput";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { Colors, Layout } from "@/constants/LiqmahTheme";
import { X, Carrot, Info } from "lucide-react-native";

export default function CreateIngredient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => createIngredient(name.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      Alert.alert("Success", "Ingredient created successfully!");
      router.back();
    },
    onError: (err: any) => {
      console.error("Ingredient creation error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create ingredient. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter an ingredient name");
      return;
    }

    mutate();
  };

  return (
    <LiqmahBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LiqmahGlass intensity={95} style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <LiqmahText variant="headline" weight="bold" style={styles.headerTitle}>Create Ingredient</LiqmahText>
            <View style={styles.headerSpacer} />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <LiqmahText style={styles.errorText} color="#DC2626">{error}</LiqmahText>
            </View>
          ) : null}

          <View style={styles.form}>
            <LiqmahInput
              label="Ingredient Name"
              placeholder="e.g., Tomato, Onion, Garlic..."
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
              icon={<Carrot size={20} color={Colors.text.tertiary} />}
            />

            <View style={styles.infoContainer}>
              <Info size={20} color={Colors.text.secondary} />
              <LiqmahText variant="caption" color={Colors.text.secondary} style={styles.infoText}>
                Add a new ingredient that can be used in recipes
              </LiqmahText>
            </View>

            <LiqmahButton
              label="Create Ingredient"
              onPress={handleSubmit}
              loading={isPending}
              style={styles.submitButton}
            />
          </View>
        </LiqmahGlass>
      </KeyboardAvoidingView>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
    justifyContent: "center",
  },
  content: {
    borderRadius: Layout.radius.modal,
    padding: Layout.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.xl,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 32,
  },
  errorContainer: {
    backgroundColor: "rgba(254, 226, 226, 0.5)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    textAlign: "center",
  },
  form: {
    gap: Layout.spacing.lg,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.base.glass.light,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: Layout.spacing.md,
  },
});
