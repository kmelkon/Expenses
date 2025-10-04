import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { exportDatabase, resetDatabase } from "../../src/db/expenseRepo";
import { useMonthStore } from "../../src/store/useMonthStore";

export default function Settings() {
  const { resetToCurrentMonth, loadMonthData } = useMonthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "0.0.1";
  const platform = Platform.OS === "ios" ? "iOS" : "Android";
  const isDev = __DEV__;

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
});
