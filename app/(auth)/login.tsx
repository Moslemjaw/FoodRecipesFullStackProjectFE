import {
  StyleSheet,
  View,
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
import { storeToken } from "@/api/storage";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahGlass } from "@/components/Liqmah/LiqmahGlass";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { LiqmahInput } from "@/components/Liqmah/LiqmahInput";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { Colors, Layout } from "@/constants/LiqmahTheme";
import { Mail, Lock } from "lucide-react-native";

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
    <LiqmahBackground gradient={Colors.gradients.mintBreeze}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <LiqmahText variant="display" weight="bold" style={styles.title}>
              Welcome Back
            </LiqmahText>
            <LiqmahText variant="body" color={Colors.text.secondary} style={styles.subtitle}>
              Sign in to continue to Liqmah
            </LiqmahText>
          </View>

          <LiqmahGlass intensity={60} style={styles.formCard}>
            {error && (
              <View style={styles.errorContainer}>
                <LiqmahText style={styles.errorText} variant="caption" color="#DC2626">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Login failed. Please try again."}
                </LiqmahText>
              </View>
            )}
            
            <LiqmahInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={20} color={Colors.text.tertiary} />}
            />

            <LiqmahInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Lock size={20} color={Colors.text.tertiary} />}
            />

            <LiqmahButton
              label="Sign In"
              onPress={handleLogin}
              loading={isPending}
              style={styles.loginButton}
            />

            <LiqmahButton
              label="Create account"
              variant="tertiary"
              onPress={() => router.navigate("/(auth)/register")}
              style={styles.registerButton}
            />
          </LiqmahGlass>
        </View>
      </KeyboardAvoidingView>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.xl,
    alignItems: 'center',
  },
  title: {
    textAlign: "center",
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  formCard: {
    padding: Layout.spacing.xl,
    borderRadius: Layout.radius.card,
  },
  errorContainer: {
    backgroundColor: "rgba(254, 226, 226, 0.5)",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: Layout.radius.button,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  errorText: {
    textAlign: "center",
  },
  loginButton: {
    marginTop: Layout.spacing.md,
  },
  registerButton: {
    marginTop: Layout.spacing.sm,
  },
});
