import Constants from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { DatabaseExport } from "../../src/db/expenseRepo";
import {
  exportDatabase,
  importDatabase,
  isValidDatabaseExport,
  resetDatabase,
} from "../../src/db/expenseRepo";
import { useMonthStore } from "../../src/store/useMonthStore";
import {
  useCategories,
  usePayers,
  useSettingsStore,
} from "../../src/store/useSettingsStore";

export default function Settings() {
  const { resetToCurrentMonth, loadMonthData } = useMonthStore();
  const categories = useCategories();
  const payers = usePayers();
  const {
    addCategory,
    deleteCategory,
    addPayer,
    updatePayerDisplayName,
    deletePayer,
  } = useSettingsStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newPayerId, setNewPayerId] = useState("");
  const [newPayerName, setNewPayerName] = useState("");
  const [editingPayerId, setEditingPayerId] = useState<string | null>(null);
  const [editingPayerName, setEditingPayerName] = useState("");

  const appVersion = Constants.expoConfig?.version ?? "0.0.1";
  const platform = Platform.OS === "ios" ? "iOS" : "Android";
  const isDev = __DEV__;

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

  const handleAddPayer = async () => {
    const trimmedId = newPayerId.trim().toLowerCase();
    const trimmedName = newPayerName.trim();

    if (!trimmedId || !trimmedName) {
      Alert.alert("Error", "Please enter both payer ID and name");
      return;
    }

    if (!/^[a-z_]+$/.test(trimmedId)) {
      Alert.alert(
        "Error",
        "Payer ID must contain only lowercase letters and underscores"
      );
      return;
    }

    try {
      await addPayer(trimmedId, trimmedName);
      setNewPayerId("");
      setNewPayerName("");
      Alert.alert("Success", `Payer "${trimmedName}" added`);
    } catch (error) {
      console.error("Failed to add payer:", error);
      Alert.alert("Error", "Failed to add payer. ID may already exist.");
    }
  };

  const handleUpdatePayerName = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      await updatePayerDisplayName(id, trimmed);
      setEditingPayerId(null);
      setEditingPayerName("");
      Alert.alert("Success", "Payer name updated");
    } catch (error) {
      console.error("Failed to update payer:", error);
      Alert.alert("Error", "Failed to update payer name");
    }
  };

  const handleDeletePayer = (payerId: string, payerName: string) => {
    Alert.alert(
      "Delete Payer",
      `Are you sure you want to delete "${payerName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePayer(payerId);
              Alert.alert("Success", `Payer "${payerName}" deleted`);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to delete payer";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportDatabase();
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `expenses_export_${
        new Date().toISOString().split("T")[0]
      }.json`;

      // Create file in cache directory using File constructor
      const file = new File(Paths.cache, fileName);
      // @ts-expect-error - Runtime expects 1 arg, but types say 2
      file.write(jsonString);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export Expenses Data",
        });
      } else {
        Alert.alert("Success", `Data exported to: ${file.uri}`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];
      if (!file?.uri) {
        Alert.alert("Import Failed", "Unable to access the selected file.");
        return;
      }

      // Use new File API instead of deprecated readAsStringAsync
      const importedFile = new File(file.uri);
      const fileContents = await importedFile.text();

      let parsed: unknown;
      try {
        parsed = JSON.parse(fileContents);
      } catch (error) {
        console.error("Failed to parse import file:", error);
        Alert.alert("Invalid File", "The selected file is not valid JSON.");
        return;
      }

      if (!isValidDatabaseExport(parsed)) {
        Alert.alert(
          "Invalid Backup",
          "The selected file does not match the expected Expenses backup format."
        );
        return;
      }

      const backup = parsed as DatabaseExport;
      const fileName = file.name ?? "selected file";

      const executeImport = () => {
        void (async () => {
          setIsImporting(true);
          try {
            await importDatabase(backup);
            resetToCurrentMonth();
            await loadMonthData();
            Alert.alert("Success", "Expenses imported successfully.");
          } catch (error) {
            console.error("Import failed:", error);
            Alert.alert(
              "Import Failed",
              "Could not import data. Please try again."
            );
          } finally {
            setIsImporting(false);
          }
        })();
      };

      Alert.alert(
        "Import Expenses",
        `Replace all current expenses with data from ${fileName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Final Confirmation",
                "This will erase existing expenses before importing. Continue?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Import",
                    style: "destructive",
                    onPress: executeImport,
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("Import flow error:", error);
      Alert.alert("Import Failed", "Something went wrong while importing.");
    }
  };

  const handleResetDatabase = () => {
    Alert.alert(
      "Reset Database",
      "Are you sure you want to delete ALL expenses? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This will permanently delete all your expense data. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Everything",
                  style: "destructive",
                  onPress: async () => {
                    setIsResetting(true);
                    try {
                      await resetDatabase();

                      // Optionally re-seed in dev mode
                      if (__DEV__ && process.env.EXPO_PUBLIC_SEED === "1") {
                        const { getDB } = await import("../../src/db/sqlite");
                        const { seed } = await import("../../src/dev/seed");
                        const db = await getDB();
                        await seed(db);
                      }

                      resetToCurrentMonth();
                      await loadMonthData();

                      Alert.alert("Success", "Database has been reset");
                    } catch (error) {
                      console.error("Reset failed:", error);
                      Alert.alert("Error", "Failed to reset database");
                    } finally {
                      setIsResetting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      {/* Payers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payers</Text>
        <View style={styles.listContainer}>
          {payers.map((payer) => (
            <View key={payer.id} style={styles.listItem}>
              {editingPayerId === payer.id ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.input}
                    value={editingPayerName}
                    onChangeText={setEditingPayerName}
                    onSubmitEditing={() =>
                      handleUpdatePayerName(payer.id, editingPayerName)
                    }
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdatePayerName(payer.id, editingPayerName)
                    }
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingPayerId(null);
                      setEditingPayerName("");
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View>
                    <Text style={styles.listItemText}>
                      {payer.display_name}
                    </Text>
                    <Text style={styles.listItemSubtext}>ID: {payer.id}</Text>
                  </View>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingPayerId(payer.id);
                        setEditingPayerName(payer.display_name);
                      }}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeletePayer(payer.id, payer.display_name)
                      }
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="ID (e.g., 'john')"
            value={newPayerId}
            onChangeText={setNewPayerId}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.inputLarge]}
            placeholder="Display name"
            value={newPayerName}
            onChangeText={setNewPayerName}
            onSubmitEditing={handleAddPayer}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPayer}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>{platform}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Environment</Text>
          <Text style={styles.infoValue}>
            {isDev ? "Development" : "Production"}
          </Text>
        </View>
      </View>

      {/* Data Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleExportData}
          disabled={isExporting}
        >
          <Text style={styles.buttonText}>
            {isExporting ? "Exporting..." : "Export Data as JSON"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Export all your expense data as a JSON file for backup or analysis
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleImportData}
          disabled={isImporting}
        >
          <Text style={styles.buttonText}>
            {isImporting ? "Importing..." : "Import Data from JSON"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Import a previously exported backup. This will replace all existing
          expenses.
        </Text>
      </View>

      {/* Database Reset Section (Dev Only) */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Tools</Text>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetDatabase}
            disabled={isResetting}
          >
            <Text style={[styles.buttonText, styles.dangerButtonText]}>
              {isResetting ? "Resetting..." : "Reset Database"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.helpText, styles.dangerText]}>
            ⚠️ This will permanently delete all expenses
          </Text>
        </View>
      )}
    </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  dangerButton: {
    backgroundColor: "#FF3B30",
  },
  dangerButtonText: {
    color: "white",
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    lineHeight: 20,
  },
  dangerText: {
    color: "#FF3B30",
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
  editForm: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
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
  inputSmall: {
    flex: 0.4,
  },
  inputLarge: {
    flex: 0.6,
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
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#007AFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  saveButton: {
    backgroundColor: "#34C759",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#8E8E93",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});
