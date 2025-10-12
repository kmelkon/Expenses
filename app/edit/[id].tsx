import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { CategoryPicker } from "../../src/components/CategoryPicker";
import {
  ExpenseRow,
  getExpenseById,
  updateExpense,
} from "../../src/db/expenseRepo";
import { Category, PayerId } from "../../src/db/schema";
import { useMonthStore } from "../../src/store/useMonthStore";
import { usePayers } from "../../src/store/useSettingsStore";
import { formatAmount, parseAmountInput } from "../../src/utils/money";
import { Theme, useTheme } from "../../src/theme";

export default function EditExpense() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refreshData } = useMonthStore();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const payers = usePayers();

  const [isLoadingExpense, setIsLoadingExpense] = useState(true);
  const [expense, setExpense] = useState<ExpenseRow | null>(null);

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [paidBy, setPaidBy] = useState<PayerId>(payers[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (paidBy || !payers.length) {
      return;
    }

    setPaidBy(payers[0].id);
  }, [payers, paidBy]);

  const payerOptions = useMemo(() => {
    if (paidBy && !payers.some((payer) => payer.id === paidBy)) {
      return [
        ...payers,
        {
          id: paidBy,
          display_name: paidBy,
          created_at: "",
        },
      ];
    }

    return payers;
  }, [payers, paidBy]);

  // Load expense data on mount
  useEffect(() => {
    const loadExpense = async () => {
      if (!id) {
        Alert.alert("Error", "No expense ID provided");
        router.back();
        return;
      }

      try {
        setIsLoadingExpense(true);
        const expenseData = await getExpenseById(id);

        if (!expenseData) {
          Alert.alert("Error", "Expense not found", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }

        // Pre-fill form with existing data
        setExpense(expenseData);
        setAmount(formatAmount(expenseData.amount_cents));
        setPaidBy(expenseData.paid_by);
        setDate(expenseData.date);
        setCategory(expenseData.category);
        setNote(expenseData.note || "");
      } catch (error) {
        console.error("Failed to load expense:", error);
        Alert.alert("Error", "Failed to load expense", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setIsLoadingExpense(false);
      }
    };

    loadExpense();
  }, [id, router]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && selectedDate) {
        setDate(format(selectedDate, "yyyy-MM-dd"));
      }
    } else {
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
    const cleaned = text.replace(/[^\d,.]/g, "");
    const normalized = cleaned.replace(",", ".");
    const parts = normalized.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return normalized;
  };

  const handleAmountChange = (text: string) => {
    const sanitized = sanitizeAmountInput(text);
    setAmount(sanitized);

    if (amountError) {
      setAmountError("");
    }
  };

  const handleSave = async () => {
    if (!expense) return;

    setAmountError("");

    // Validate amount
    const amountCents = parseAmountInput(amount);
    if (!amountCents || amountCents <= 0) {
      setAmountError("Please enter a valid amount greater than 0");
      return;
    }

    // Validate other fields
    if (!paidBy) {
      Alert.alert("Error", "Please select who paid");
      return;
    }

    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    // Validate date
    if (!date.trim()) {
      Alert.alert("Error", "Please enter a date");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert("Error", "Please enter date in YYYY-MM-DD format");
      return;
    }

    setIsLoading(true);

    try {
      await updateExpense({
        id: expense.id,
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
      console.error("Failed to update expense:", error);
      Alert.alert("Error", "Failed to update expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading state while fetching expense
  if (isLoadingExpense) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading expense...</Text>
      </View>
    );
  }

  // If expense failed to load, don't render the form
  if (!expense) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
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
          />
          {amountError && <Text style={styles.errorText}>{amountError}</Text>}
        </View>

        {/* Paid By */}
        <View style={styles.section}>
          <Text style={styles.label}>Paid by</Text>
          {payerOptions.length === 0 ? (
            <Text style={styles.emptyStateText}>
              No payers found. Please add one in Settings.
            </Text>
          ) : (
            <View style={styles.segmentedControl}>
              {payerOptions.map((payer, index) => {
                const isActive = paidBy === payer.id;
                const buttonStyles = [styles.segmentButton];

                if (index !== payerOptions.length - 1) {
                  buttonStyles.push(styles.segmentButtonDivider);
                }

                if (isActive) {
                  buttonStyles.push(styles.segmentButtonActive);
                }

                const textStyles = [styles.segmentButtonText];
                if (isActive) {
                  textStyles.push(styles.segmentButtonTextActive);
                }

                return (
                  <TouchableOpacity
                    key={payer.id}
                    style={buttonStyles}
                    onPress={() => setPaidBy(payer.id)}
                  >
                    <Text style={textStyles}>{payer.display_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
            paddingBottom: insets.bottom + theme.spacing.md,
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      marginBottom: theme.spacing.xxl,
    },
    label: {
      ...theme.typography.headingSm,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 8,
      padding: theme.spacing.md,
      fontSize: 16,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    noteInput: {
      height: 80,
    },
    amountInput: {
      textAlign: "right",
    },
    errorInput: {
      borderColor: theme.colors.danger,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 14,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    segmentedControl: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
    },
    segmentButtonDivider: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.borderStrong,
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.accent,
    },
    segmentButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
    segmentButtonTextActive: {
      color: theme.colors.accentOn,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    buttons: {
      flexDirection: "row",
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.accent,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.accentOn,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 8,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    datePickerContainer: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      overflow: "hidden",
    },
  });
