"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow, PayerRow } from "@expenses/shared";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DonutChartPlaceholder } from "@/components/charts/donut-chart-placeholder";
import { LineChartPlaceholder } from "@/components/charts/line-chart-placeholder";
import { AddExpenseButton } from "@/components/add-expense-button";

interface InsightsContentProps {
  userName: string;
  householdId: string;
  categories: CategoryRow[];
  payers: PayerRow[];
}

export function InsightsContent({
  userName,
  householdId,
  categories,
  payers,
}: InsightsContentProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const router = useRouter();

  return (
    <AppShell
      title="Insights"
      userName={userName}
      onAddClick={() => setAddModalOpen(true)}
    >
      <div className="space-y-6">
        {/* Header text */}
        <div className="text-center py-4">
          <p className="text-[var(--warm-500)] text-sm">
            Spending analytics coming soon...
          </p>
        </div>

        {/* Category breakdown card */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChartPlaceholder title="" />
          </CardContent>
        </Card>

        {/* Monthly trends card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartPlaceholder title="" />
          </CardContent>
        </Card>
      </div>

      <AddExpenseButton
        categories={categories}
        payers={payers}
        householdId={householdId}
        onAdded={() => router.refresh()}
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
    </AppShell>
  );
}
