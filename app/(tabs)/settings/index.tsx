import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { Theme, useTheme } from "../../../src/theme";

export default function Settings() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
            onPress={() => router.push("/settings/appearance")}
          >
            <Text style={styles.menuItemText}>Appearance</Text>
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    menuItemChevron: {
      fontSize: 24,
      color: theme.colors.textMuted,
      fontWeight: "300",
    },
    sectionTitle: {
      ...theme.typography.headingMd,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    listContainer: {
      marginBottom: theme.spacing.md,
    },
    listItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    listItemText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    listItemSubtext: {
      fontSize: 13,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
    addForm: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: 8,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm + 2,
      justifyContent: "center",
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.accentOn,
    },
    deleteButton: {
      backgroundColor: theme.colors.danger,
      borderRadius: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.dangerOn,
    },
  });
