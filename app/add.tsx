import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryPicker } from "../src/components/CategoryPicker";
import { addExpense } from "../src/db/expenseRepo";
import { Category, PayerId } from "../src/db/sqlite";
import { useMonthStore } from "../src/store/useMonthStore";
import { getTodayYYYYMMDD } from "../src/utils/date";
import { parseAmountInput } from "../src/utils/money";

export default function AddExpense() {
  const router = useRouter();
  const { refreshData } = useMonthStore();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [paidBy, setPaidBy] = useState<PayerId>("you");
  const [date, setDate] = useState(getTodayYYYYMMDD());
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // On Android, showDatePicker controls whether the modal shows
      setShowDatePicker(false);
      // Only update date if user selected a date (not dismissed)
      if (event.type === "set" && selectedDate) {
        setDate(format(selectedDate, "yyyy-MM-dd"));
      }
    } else {
      // On iOS, always update if selectedDate is provided
      if (selectedDate) {
        setDate(format(selectedDate, "yyyy-MM-dd"));
      }
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: new Date(date),
        mode: "date",
        onChange: handleDateChange,
      });
    } else {
      setShowDatePicker(!showDatePicker);
    }
  };

  const sanitizeAmountInput = (text: string): string => {
    // Allow only digits and one decimal separator (, or .)
    const cleaned = text.replace(/[^\d,.]/g, "");

    // Normalize comma to dot
    const normalized = cleaned.replace(",", ".");

    // Ensure only one decimal separator
    const parts = normalized.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    return normalized;
  };

  const handleAmountChange = (text: string) => {
    const sanitized = sanitizeAmountInput(text);
    setAmount(sanitized);

    // Clear error when user starts typing
    if (amountError) {
      setAmountError("");
    }
  };

  const handleSave = async () => {
    // Clear any existing amount error
    setAmountError("");

    // Validate amount
    const amountCents = parseAmountInput(amount);
    if (!amountCents || amountCents <= 0) {
      setAmountError("Please enter a valid amount greater than 0");
      return;
    }

    // Validate other fields
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!date.trim()) {
      Alert.alert("Error", "Please enter a date");
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (SEK)</Text>
          <TextInput
            style={[
              styles.textInput,
              styles.amountInput,
              amountError && styles.errorInput,
            ]}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="decimal-pad"
            inputMode="decimal"
            textAlign="right"
            autoFocus
            inputAccessoryViewID="amount-input-accessory"
          />
          {amountError && <Text style={styles.errorText}>{amountError}</Text>}
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
          <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
            <Text style={styles.dateButtonText}>{date}</Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={new Date(date)}
                mode="date"
                display="inline"
                onChange={handleDateChange}
              />
            </View>
          )}
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
      <View
        style={[
          styles.buttons,
          {
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
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
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  amountInput: {
    textAlign: "right",
  },
  errorInput: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: StyleSheet.hairlineWidth,
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
  dateButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  datePickerContainer: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
  },
});
