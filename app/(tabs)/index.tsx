import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import BottomNav from "../../src/components/BottomNav";
import { PayerChip } from "../../src/components/PayerChip";
import { TotalsTables } from "../../src/components/TotalsTables";
import { ExpenseRow, deleteExpense } from "../../src/db/expenseRepo";
import { useMonthStore } from "../../src/store/useMonthStore";
import { Theme, useTheme } from "../../src/theme";
import {
  formatExpenseDate,
  formatMonthDisplay,
  getCurrentMonth,
  getNextMonth,
  getPreviousMonth,
} from "../../src/utils/date";
import { formatAmount } from "../../src/utils/money";

export default function Index() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    selectedMonth,
    expenses,
    summary,
    isLoading,
    error,
    setSelectedMonth,
    loadMonthData,
    resetToCurrentMonth,
  } = useMonthStore();

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  const handlePreviousMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonth(selectedMonth));
  };

  const handleMonthTitlePress = () => {
    // Only navigate if not already on current month
    if (selectedMonth !== getCurrentMonth()) {
      resetToCurrentMonth();
    }
  };

  const handleDeleteExpense = async (expense: ExpenseRow) => {
    Alert.alert(
      "Delete Expense",
      `Delete ${expense.category} (${formatAmount(expense.amount_cents)})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              await loadMonthData();
            } catch (error) {
              console.error("Failed to delete expense:", error);
              Alert.alert(
                "Error",
                "Failed to delete expense. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleEditExpense = (expenseId: string) => {
    router.push(`/edit/${expenseId}`);
  };

  const renderRightActions = (expense: ExpenseRow) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDeleteExpense(expense)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderExpenseItem = ({ item }: { item: ExpenseRow }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => handleEditExpense(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseDate}>{formatExpenseDate(item.date)}</Text>
          <PayerChip payerId={item.paid_by} size="small" />
        </View>
        <View style={styles.expenseBody}>
          <View style={styles.expenseLeft}>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            {item.note && <Text style={styles.expenseNote}>{item.note}</Text>}
          </View>
          <Text style={styles.expenseAmount}>
            {formatAmount(item.amount_cents)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No expenses this month</Text>
      <Text style={styles.emptyStateMessage}>
        Tap the Add button below to add your first expense
      </Text>
    </View>
  );

  if (error) {
    Alert.alert("Error", error);
  }

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={handlePreviousMonth}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <Pressable
          onPress={handleMonthTitlePress}
          style={({ pressed }) => [
            styles.monthTitleContainer,
            pressed &&
              selectedMonth !== getCurrentMonth() &&
              styles.monthTitlePressed,
          ]}
        >
          <Text style={styles.monthTitle}>
            {formatMonthDisplay(selectedMonth)}
          </Text>
        </Pressable>

        <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            summary && summary.totalsByCategory.length > 0 ? (
              <TotalsTables summary={summary} />
            ) : null
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    monthNavigation: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    monthButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    monthTitle: {
      ...theme.typography.headingSm,
      color: theme.colors.text,
    },
    monthTitleContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: 8,
    },
    monthTitlePressed: {
      backgroundColor: theme.colors.surfaceMuted,
      opacity: 0.7,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    expenseItem: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    expenseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    expenseDate: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    expenseBody: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    expenseLeft: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    expenseCategory: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
    },
    expenseNote: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    expenseAmount: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.accent,
      textAlign: "right",
      flexWrap: "nowrap",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xxxl * 2,
    },
    emptyStateTitle: {
      ...theme.typography.headingSm,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    emptyStateMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    deleteAction: {
      backgroundColor: theme.colors.danger,
      justifyContent: "center",
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      borderRadius: 12,
    },
    deleteText: {
      color: theme.colors.dangerOn,
      fontWeight: "600",
      fontSize: 16,
    },
  });
