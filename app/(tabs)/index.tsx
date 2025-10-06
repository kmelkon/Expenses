import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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
import Swipeable from "react-native-gesture-handler/Swipeable";
import BottomNav from "../../src/components/BottomNav";
import { PayerChip } from "../../src/components/PayerChip";
import { TotalsTables } from "../../src/components/TotalsTables";
import { ExpenseRow, deleteExpense } from "../../src/db/expenseRepo";
import { useMonthStore } from "../../src/store/useMonthStore";
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
          {/* TODO: use icon instead of text for the chevron here and for the next button">"" */}
          <Text style={styles.monthButtonText}>‹</Text>
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
          <Text style={styles.monthButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  monthTitleContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  monthTitlePressed: {
    backgroundColor: "#F0F0F0",
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 16, // Reduced since no floating button
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseDate: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  expenseBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expenseLeft: {
    flex: 1,
    marginRight: 12,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  expenseNote: {
    fontSize: 14,
    color: "#666",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "right",
    flexWrap: "nowrap",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
