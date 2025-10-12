import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  usePayers,
  useSettingsStore,
} from "../../../src/store/useSettingsStore";
import { Theme, useTheme } from "../../../src/theme";

export default function PayersScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const payers = usePayers();
  const { addPayer, updatePayerDisplayName, deletePayer } = useSettingsStore();

  const [newPayerId, setNewPayerId] = useState("");
  const [newPayerName, setNewPayerName] = useState("");
  const [editingPayerId, setEditingPayerId] = useState<string | null>(null);
  const [editingPayerName, setEditingPayerName] = useState("");

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Payers</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
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
    editForm: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      flex: 1,
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
    inputSmall: {
      flex: 0.4,
    },
    inputLarge: {
      flex: 0.6,
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
    buttonGroup: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    editButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.accentOn,
    },
    saveButton: {
      backgroundColor: theme.colors.success,
      borderRadius: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.successOn,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
  });
