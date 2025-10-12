import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MonthSummary } from "../db/expenseRepo";
import { Category } from "../db/schema";
import { useCategories, usePayers } from "../store/useSettingsStore";
import { formatAmount } from "../utils/money";
import { PayerChip } from "./PayerChip";
import { Theme, useTheme } from "../theme";

interface TotalsTablesProps {
  summary: MonthSummary;
}

export function TotalsTables({ summary }: TotalsTablesProps) {
  const categories = useCategories();
  const payers = usePayers();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Create a map for easy lookup of category totals by person
  const categoryTotalsMap = new Map<Category, Record<string, number>>();

  summary.totalsByCategory.forEach(({ category, paid_by, total }) => {
    const current = categoryTotalsMap.get(category) ?? {};
    // Initialize all payers to 0 if not present
    payers.forEach((p) => {
      if (!(p.id in current)) {
        current[p.id] = 0;
      }
    });
    current[paid_by] = total;
    categoryTotalsMap.set(category, current);
  });

  return (
    <View style={styles.container}>
      {/* Summary by Person */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Totals</Text>
        <View style={styles.summaryRow}>
          {payers.map((payer) => {
            const total =
              summary.totalsByPerson.find((p) => p.paid_by === payer.id)
                ?.total ?? 0;
            return (
              <View key={payer.id} style={styles.summaryItem}>
                <PayerChip payerId={payer.id} size="small" />
                <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
              </View>
            );
          })}
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
              {payers.map((payer) => (
                <Text
                  key={payer.id}
                  style={[styles.tableHeaderText, styles.amountColumn]}
                >
                  {payer.display_name}
                </Text>
              ))}
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>
                Total
              </Text>
            </View>

            {/* Table Rows */}
            {categories.map((category) => {
              const totals = categoryTotalsMap.get(category.name);
              if (!totals) {
                return null; // Skip categories with no expenses
              }

              // Check if category has any expenses
              const hasExpenses = Object.values(totals).some((v) => v > 0);
              if (!hasExpenses) {
                return null;
              }

              const rowTotal = Object.values(totals).reduce(
                (sum, v) => sum + v,
                0
              );

              return (
                <View key={category.id} style={styles.tableRow}>
                  <Text style={[styles.tableCellText, styles.categoryColumn]}>
                    {category.name}
                  </Text>
                  {payers.map((payer) => (
                    <Text
                      key={payer.id}
                      style={[styles.tableCellText, styles.amountColumn]}
                    >
                      {totals[payer.id] > 0
                        ? formatAmount(totals[payer.id])
                        : "-"}
                    </Text>
                  ))}
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
              {payers.map((payer) => {
                const total =
                  summary.totalsByPerson.find((p) => p.paid_by === payer.id)
                    ?.total ?? 0;
                return (
                  <Text
                    key={payer.id}
                    style={[
                      styles.tableCellText,
                      styles.amountColumn,
                      styles.boldText,
                    ]}
                  >
                    {formatAmount(total)}
                  </Text>
                );
              })}
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      ...theme.typography.headingMd,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: theme.spacing.md,
    },
    summaryItem: {
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    summaryAmount: {
      ...theme.typography.bodyStrong,
      color: theme.colors.text,
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    grandTotalLabel: {
      ...theme.typography.bodyStrong,
      color: theme.colors.text,
    },
    grandTotalAmount: {
      ...theme.typography.bodyStrong,
      color: theme.colors.accent,
    },
    table: {
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceMuted,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    tableHeaderText: {
      ...theme.typography.captionStrong,
      color: theme.colors.textSecondary,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    grandTotalTableRow: {
      backgroundColor: theme.colors.surfaceMuted,
      borderBottomWidth: 0,
    },
    tableCellText: {
      ...theme.typography.caption,
      color: theme.colors.text,
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
