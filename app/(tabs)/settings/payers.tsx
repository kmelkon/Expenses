import { useState } from "react";
import {
  Alert,
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

export default function PayersScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
