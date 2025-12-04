import { Home, Search, Heart, User, Plus, X, ChevronRight, Folder, Utensils, Carrot } from "lucide-react-native";
import { Tabs, useRouter } from "expo-router";
import { useState, useContext } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Colors, Shadows, Layout, Typography } from "@/constants/LiqmahTheme";
import AuthContext from "@/context/AuthContext";

export default function TabsLayout() {
  const router = useRouter();
  const { isAutheticated } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateOption = (route: string) => {
    setModalVisible(false);
    router.push(route as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary.fern,
          tabBarInactiveTintColor: Colors.text.tertiary,
          tabBarStyle: {
            backgroundColor: Colors.base.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.base.border.light,
            paddingBottom: 0,
            paddingTop: 8,
            height: 70,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            ...Shadows.dock,
          },
          headerShown: false,
          tabBarLabelStyle: {
            display: 'none', // No labels
          },
          tabBarIconStyle: {
            marginTop: 0,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(explore)"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "",
            tabBarIcon: () => (
              <View style={styles.createButton}>
                <Plus size={30} color="#FFFFFF" />
              </View>
            ),
            tabBarButton: ({ children }) => (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.createButtonContainer}
                activeOpacity={0.9}
              >
                {children}
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="(favorites)"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color, size }) => (
              <Heart size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (!isAutheticated) {
                e.preventDefault();
                Alert.alert(
                  "Sign In Required",
                  "Please sign in to view your favorites.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign In", onPress: () => router.push("/(auth)/login") },
                  ]
                );
              }
            },
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (!isAutheticated) {
                e.preventDefault();
                Alert.alert(
                  "Sign In Required",
                  "Please sign in to view your profile.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign In", onPress: () => router.push("/(auth)/login") },
                  ]
                );
              }
            },
          }}
        />
      </Tabs>

      {/* Create Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                handleCreateOption("/(modals)/createRecipe")
              }
            >
              <View style={[styles.optionIcon, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                <Utensils size={24} color="#EF4444" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Recipe</Text>
                <Text style={styles.optionSubtitle}>
                  Share your delicious recipe
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                handleCreateOption("/(modals)/createIngredient")
              }
            >
              <View style={[styles.optionIcon, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                <Carrot size={24} color="#22C55E" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Ingredient</Text>
                <Text style={styles.optionSubtitle}>Add a new ingredient</Text>
              </View>
              <ChevronRight size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                handleCreateOption("/(modals)/createCategory")
              }
            >
              <View style={[styles.optionIcon, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
                <Folder size={24} color="#3B82F6" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Category</Text>
                <Text style={styles.optionSubtitle}>Create a new category</Text>
              </View>
              <ChevronRight size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  createButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -32, // More pronounced lift for floating feel
  },
  createButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.fern,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.button.fern,
    borderWidth: 2,
    borderColor: Colors.base.white,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.base.surface,
    borderTopLeftRadius: Layout.radius.modal,
    borderTopRightRadius: Layout.radius.modal,
    padding: 24,
    paddingBottom: 48,
    ...Shadows.floating,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.headline,
    color: Colors.text.primary,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.base.paper,
    borderRadius: Layout.radius.button,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.body,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.caption,
    color: Colors.text.secondary,
  },
});
