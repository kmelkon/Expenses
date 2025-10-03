import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { CategoryPicker } from "../src/components/CategoryPicker";
import { addExpense } from "../src/db/expenseRepo";
import { Category, PayerId } from "../src/db/sqlite";
import { useMonthStore } from "../src/store/useMonthStore";
import { getTodayYYYYMMDD } from "../src/utils/date";
import { parseAmountInput } from "../src/utils/money";

export default function AddExpense() {
  const router = useRouter();
  const { refreshData } = useMonthStore();

  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<PayerId>("you");
  const [date, setDate] = useState(getTodayYYYYMMDD());
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!amount.trim()) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!date.trim()) {
      Alert.alert("Error", "Please enter a date");
      return;
    }

    let amountCents: number;
    try {
      amountCents = parseAmountInput(amount);
      if (amountCents <= 0) {
        Alert.alert("Error", "Amount must be greater than 0");
        return;
      }
    } catch {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert("Error", "Please enter date in YYYY-MM-DD format");
      return;
    }

    setIsLoading(true);

    try {
      await addExpense({
        amount_cents: amountCents,
        paid_by: paidBy,
        date,
        category,
        note: note.trim() || undefined,
      });

      // Refresh the data and go back
      await refreshData();
      router.back();
    } catch (error) {
      console.error("Failed to add expense:", error);
      Alert.alert("Error", "Failed to save expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (SEK)</Text>
          <TextInput
            style={styles.textInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Paid By */}
        <View style={styles.section}>
          <Text style={styles.label}>Paid by</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                paidBy === "you" && styles.segmentButtonActive,
              ]}
              onPress={() => setPaidBy("you")}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  paidBy === "you" && styles.segmentButtonTextActive,
                ]}
              >
                Karam
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                paidBy === "partner" && styles.segmentButtonActive,
              ]}
              onPress={() => setPaidBy("partner")}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  paidBy === "partner" && styles.segmentButtonTextActive,
                ]}
              >
                Kazi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <CategoryPicker
            selectedCategory={category}
            onSelect={setCategory}
            placeholder="Select category"
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333",
  },
  noteInput: {
    height: 80,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    alignItems: "center",
  },
  segmentButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },
  segmentButtonRight: {
    // No additional styles needed
  },
  segmentButtonActive: {
    backgroundColor: "#007AFF",
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  segmentButtonTextActive: {
    color: "white",
  },
  buttons: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
