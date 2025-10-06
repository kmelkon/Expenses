import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { DatabaseExport } from "../../../src/db/expenseRepo";
import {
  exportDatabase,
  importDatabase,
  isValidDatabaseExport,
} from "../../../src/db/expenseRepo";
import { useMonthStore } from "../../../src/store/useMonthStore";

export default function DataManagement() {
  const { resetToCurrentMonth, loadMonthData } = useMonthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>

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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import Data</Text>

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
  helpText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    lineHeight: 20,
  },
});
