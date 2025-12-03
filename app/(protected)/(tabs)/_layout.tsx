import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateOption = (route: string) => {
    setModalVisible(false);
    router.push(route as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(explore)"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "",
            tabBarIcon: () => (
              <View style={styles.createButton}>
                <Ionicons name="add" size={30} color="#FFFFFF" />
              </View>
            ),
            tabBarButton: ({ children }) => (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.createButtonContainer}
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
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
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
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                handleCreateOption("/(protected)/(modals)/createRecipe")
              }
            >
              <View style={[styles.optionIcon, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="restaurant-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Recipe</Text>
                <Text style={styles.optionSubtitle}>
                  Share your delicious recipe
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                handleCreateOption("/(protected)/(modals)/createIngredient")
              }
            >
              <View style={[styles.optionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="nutrition-outline" size={24} color="#22C55E" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Ingredient</Text>
                <Text style={styles.optionSubtitle}>Add a new ingredient</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                handleCreateOption("/(protected)/(modals)/createCategory")
              }
            >
              <View style={[styles.optionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="folder-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Category</Text>
                <Text style={styles.optionSubtitle}>Create a new category</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});
