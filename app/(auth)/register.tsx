import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import AuthContext from "@/context/AuthContext";
import { register } from "@/api/auth";
import { storeToken } from "@/api/storage";
import { LiqmahBackground } from "@/components/Liqmah/LiqmahBackground";
import { LiqmahGlass } from "@/components/Liqmah/LiqmahGlass";
import { LiqmahText } from "@/components/Liqmah/LiqmahText";
import { LiqmahInput } from "@/components/Liqmah/LiqmahInput";
import { LiqmahButton } from "@/components/Liqmah/LiqmahButton";
import { Colors, Layout, Shadows } from "@/constants/LiqmahTheme";
import { Camera, User, Mail, Lock } from "lucide-react-native";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const { setIsAutheticated } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: () => register({ email, password }, image || "", name),
    onSuccess: async (data) => {
      await storeToken(data.token);
      setIsAutheticated(true);
      router.replace("/(tabs)/(home)/" as any);
    },
  });

  const handleRegistration = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (email && password && name) {
      mutate();
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <LiqmahBackground gradient={Colors.gradients.aquaDaybreak}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <LiqmahText variant="display" weight="bold" style={styles.title}>
                Create Account
              </LiqmahText>
              <LiqmahText variant="body" color={Colors.text.secondary} style={styles.subtitle}>
                Sign up to get started
              </LiqmahText>
            </View>

            <View style={styles.profilePicContainer}>
              <TouchableOpacity
                style={styles.profilePicButton}
                onPress={pickImage}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.profilePic} />
                ) : (
                  <View style={styles.profilePicPlaceholder}>
                    <Camera size={32} color={Colors.text.tertiary} />
                    <LiqmahText variant="micro" color={Colors.text.secondary} weight="medium" style={styles.addPhotoText}>
                      Add Photo
                    </LiqmahText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <LiqmahGlass intensity={60} style={styles.formCard}>
              <LiqmahInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                icon={<User size={20} color={Colors.text.tertiary} />}
              />

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

              <LiqmahInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                icon={<Lock size={20} color={Colors.text.tertiary} />}
              />

              <LiqmahButton
                label="Sign Up"
                onPress={handleRegistration}
                loading={isPending}
                style={styles.registerButton}
              />

              <LiqmahButton
                label="Already have an account? Sign in"
                variant="tertiary"
                onPress={() => router.navigate("/")}
                style={styles.loginLink}
              />
            </LiqmahGlass>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LiqmahBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: Layout.spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.lg,
    alignItems: 'center',
  },
  title: {
    textAlign: "center",
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: Layout.spacing.xl,
  },
  profilePicButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: Colors.base.white,
    borderWidth: 3,
    borderColor: Colors.base.glass.medium,
    ...Shadows.floating,
  },
  profilePic: {
    width: "100%",
    height: "100%",
  },
  profilePicPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.base.cloud,
  },
  addPhotoText: {
    marginTop: 4,
  },
  formCard: {
    padding: Layout.spacing.xl,
    borderRadius: Layout.radius.card,
  },
  registerButton: {
    marginTop: Layout.spacing.md,
  },
  loginLink: {
    marginTop: Layout.spacing.sm,
  },
});
