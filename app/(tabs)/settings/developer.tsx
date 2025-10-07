import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { resetDatabase } from "../../../src/db/expenseRepo";
import { useMonthStore } from "../../../src/store/useMonthStore";

export default function DeveloperTools() {
  const { resetToCurrentMonth, loadMonthData } = useMonthStore();
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = () => {
    Alert.alert(
      "Seed Data",
      "Insert sample expenses across recent months? Existing categories and payers will be kept as-is.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Seed",
          onPress: async () => {
            setIsSeeding(true);
            try {
              const { getDB } = await import("../../../src/db/sqlite");
              const { seed } = await import("../../../src/dev/seed");

              const db = await getDB();
              const didSeed = await seed(db);

              if (didSeed) {
                resetToCurrentMonth();
                await loadMonthData();
                Alert.alert("Success", "Sample expenses have been added.");
              } else {
                Alert.alert(
                  "No changes",
                  "Seed data was skipped because expenses already exist. Reset the database first if you want a clean seed."
                );
              }
            } catch (error) {
              console.error("Seed failed:", error);
              Alert.alert("Error", "Failed to seed data");
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ]
    );
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database</Text>

        <TouchableOpacity
          style={[
            styles.button,
            styles.dangerButton,
            (isResetting || isSeeding) && styles.disabledButton,
          ]}
          onPress={handleResetDatabase}
          disabled={isResetting || isSeeding}
        >
          <Text style={[styles.buttonText, styles.dangerButtonText]}>
            {isResetting ? "Resetting..." : "Reset Database"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.helpText, styles.dangerText]}>
          ⚠️ This will permanently delete all expenses
        </Text>

        <TouchableOpacity
          style={[styles.button, (isResetting || isSeeding) && styles.disabledButton]}
          onPress={handleSeedData}
          disabled={isResetting || isSeeding}
        >
          <Text style={styles.buttonText}>
            {isSeeding ? "Seeding..." : "Seed Data"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Inserts realistic sample expenses across recent months without
          modifying categories or payers.
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
  dangerButton: {
    backgroundColor: "#FF3B30",
  },
  dangerButtonText: {
    color: "white",
  },
  disabledButton: {
    opacity: 0.6,
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
