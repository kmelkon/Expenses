import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../../../src/components/BottomNav";
import {
  useCategories,
  useSettingsStore,
} from "../../../src/store/useSettingsStore";

export default function Settings() {
  const router = useRouter();
  const categories = useCategories();
  const { addCategory, deleteCategory } = useSettingsStore();

  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    try {
      await addCategory(trimmed);
      setNewCategoryName("");
      Alert.alert("Success", `Category "${trimmed}" added`);
    } catch (error) {
      console.error("Failed to add category:", error);
      Alert.alert("Error", "Failed to add category. It may already exist.");
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(categoryName);
              Alert.alert("Success", `Category "${categoryName}" deleted`);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to delete category";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Settings Menu */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/settings/payers")}
          >
            <Text style={styles.menuItemText}>Manage Payers</Text>
            <Text style={styles.menuItemChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/settings/data-management")}
          >
            <Text style={styles.menuItemText}>Data Management</Text>
            <Text style={styles.menuItemChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/settings/about")}
          >
            <Text style={styles.menuItemText}>About</Text>
            <Text style={styles.menuItemChevron}>›</Text>
          </TouchableOpacity>
          {__DEV__ && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings/developer")}
            >
              <Text style={styles.menuItemText}>Developer Tools</Text>
              <Text style={styles.menuItemChevron}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.listContainer}>
            {categories.map((category) => (
              <View key={category.id} style={styles.listItem}>
                <Text style={styles.listItemText}>{category.name}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(category.name)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="New category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              onSubmitEditing={handleAddCategory}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuItemChevron: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  listContainer: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  listItemSubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  addForm: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});
