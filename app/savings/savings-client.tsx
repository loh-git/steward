"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiggyBankIcon } from "@/app/dashboard/components/icons";
import {
  RecurringBudgetPage,
  parseRecurringPayload,
  type RecurringFormValues,
} from "@/app/components/recurring-budget-page";
import type { SavingsGoal } from "@/types/savingsGoals";

export default function SavingsClient({
  initialItems,
}: {
  initialItems: SavingsGoal[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/savings-goals");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }

  return (
    <RecurringBudgetPage
      title="Savings Goals"
      description="Define monthly savings targets. These pre-fill each month's savings column in your planner."
      icon={<PiggyBankIcon className="text-brass-700" />}
      accentClass="bg-brass-100"
      buttonClass="bg-brass-600 hover:bg-brass-700"
      showSavingsFields
      items={items}
      onAdd={async (values: RecurringFormValues) => {
        const res = await fetch("/api/savings-goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parseRecurringPayload(values)),
        });
        if (!res.ok) throw new Error("Failed to add savings goal");
        await refresh();
      }}
      onUpdate={async (id, values) => {
        const res = await fetch("/api/savings-goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...parseRecurringPayload(values) }),
        });
        if (!res.ok) throw new Error("Failed to update savings goal");
        await refresh();
      }}
      onDelete={async (id) => {
        const res = await fetch(`/api/savings-goals?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete savings goal");
        await refresh();
      }}
    />
  );
}
