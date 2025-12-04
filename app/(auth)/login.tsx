import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import UserInfo from "@/types/UserInfo";
import { login } from "@/api/auth";
import { storeToken, storeUser } from "@/api/storage";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setIsAutheticated } = useContext(AuthContext);
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationKey: ["Login"],
    mutationFn: (userInfo: UserInfo) => login(userInfo),
    onSuccess: async (data) => {
      console.log("Login success, data:", data);
      if (data?.token) {
        await storeToken(data.token);
        // Store user data if available (normalize id to _id)
        if (data?.user) {
          const normalizedUser = {
            ...data.user,
            _id: data.user.id || data.user._id,
          };
          await storeUser(normalizedUser);
        }
        console.log("Token stored, setting authenticated to true");
        setIsAutheticated(true);
        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log("Navigating to protected route");
          router.replace("/(protected)/(tabs)/(home)/" as any);
        }, 100);
      } else {
        console.log("No token in response:", data);
        Alert.alert("Error", "Invalid response from server");
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials and try again.";
      Alert.alert("Login Error", errorMessage);
    },
  });

  const handleLogin = () => {
    if (email && password) {
      mutate({ email, password });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error?.response?.data?.message ||
                  error?.message ||
                  "Login failed. Please try again."}
              </Text>
            </View>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isPending && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isPending}
          >
            <Text style={styles.loginButtonText}>
              {isPending ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.navigate("/(auth)/register")}
          >
            <Text style={styles.forgotPasswordText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  forgotPassword: {
    marginTop: 20,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
});
