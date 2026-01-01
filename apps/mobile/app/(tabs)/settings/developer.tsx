import { useMemo, useState } from "react";
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
import { Theme, useTheme } from "../../../src/theme";

export default function DeveloperTools() {
  const { resetToCurrentMonth, loadMonthData } = useMonthStore();
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
    sectionTitle: {
      ...theme.typography.headingMd,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    button: {
      backgroundColor: theme.colors.accent,
      borderRadius: 8,
      padding: theme.spacing.md + 2,
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.accentOn,
    },
    dangerButton: {
      backgroundColor: theme.colors.danger,
    },
    dangerButtonText: {
      color: theme.colors.dangerOn,
    },
    disabledButton: {
      opacity: 0.6,
    },
    helpText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      lineHeight: 20,
    },
    dangerText: {
      color: theme.colors.danger,
    },
  });
