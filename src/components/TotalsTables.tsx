import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MonthSummary } from "../db/expenseRepo";
import { CATEGORIES, Category, PayerId } from "../db/schema";
import { formatAmount } from "../utils/money";
import { PayerChip } from "./PayerChip";

interface TotalsTablesProps {
  summary: MonthSummary;
}

export function TotalsTables({ summary }: TotalsTablesProps) {
  // Create a map for easy lookup of category totals by person
  const categoryTotalsMap = new Map<Category, Record<PayerId, number>>();

  summary.totalsByCategory.forEach(({ category, paid_by, total }) => {
    const current = categoryTotalsMap.get(category) ?? { you: 0, partner: 0 };
    current[paid_by] = total;
    categoryTotalsMap.set(category, current);
  });

  return (
    <View style={styles.container}>
      {/* Summary by Person */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Totals</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <PayerChip payerId="you" size="small" />
            <Text style={styles.summaryAmount}>
              {formatAmount(summary.youTotal)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <PayerChip payerId="partner" size="small" />
            <Text style={styles.summaryAmount}>
              {formatAmount(summary.partnerTotal)}
            </Text>
          </View>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total (SEK)</Text>
          <Text style={styles.grandTotalAmount}>
            {formatAmount(summary.grandTotal)}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      {summary.totalsByCategory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Category</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.categoryColumn]}>
                Category
              </Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>
                Karam
              </Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>
                Kazi
              </Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>
                Total
              </Text>
            </View>

            {/* Table Rows */}
            {CATEGORIES.map((category) => {
              const totals = categoryTotalsMap.get(category);
              if (!totals || (totals.you === 0 && totals.partner === 0)) {
                return null; // Skip categories with no expenses
              }

              const rowTotal = totals.you + totals.partner;

              return (
                <View key={category} style={styles.tableRow}>
                  <Text style={[styles.tableCellText, styles.categoryColumn]}>
                    {category}
                  </Text>
                  <Text style={[styles.tableCellText, styles.amountColumn]}>
                    {totals.you > 0 ? formatAmount(totals.you) : "-"}
                  </Text>
                  <Text style={[styles.tableCellText, styles.amountColumn]}>
                    {totals.partner > 0 ? formatAmount(totals.partner) : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellText,
                      styles.amountColumn,
                      styles.boldText,
                    ]}
                  >
                    {formatAmount(rowTotal)}
                  </Text>
                </View>
              );
            })}

            {/* Grand Total Row */}
            <View style={[styles.tableRow, styles.grandTotalTableRow]}>
              <Text
                style={[
                  styles.tableCellText,
                  styles.categoryColumn,
                  styles.boldText,
                ]}
              >
                TOTAL
              </Text>
              <Text
                style={[
                  styles.tableCellText,
                  styles.amountColumn,
                  styles.boldText,
                ]}
              >
                {formatAmount(summary.youTotal)}
              </Text>
              <Text
                style={[
                  styles.tableCellText,
                  styles.amountColumn,
                  styles.boldText,
                ]}
              >
                {formatAmount(summary.partnerTotal)}
              </Text>
              <Text
                style={[
                  styles.tableCellText,
                  styles.amountColumn,
                  styles.boldText,
                ]}
              >
                {formatAmount(summary.grandTotal)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginBottom: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: "center",
    gap: 8,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  table: {
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  grandTotalTableRow: {
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 0,
  },
  tableCellText: {
    fontSize: 12,
    color: "#333",
  },
  categoryColumn: {
    flex: 2,
  },
  amountColumn: {
    flex: 1,
    textAlign: "right",
    flexWrap: "nowrap",
  },
  boldText: {
    fontWeight: "600",
  },
});
