"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReceiptIcon } from "@/app/dashboard/components/icons";
import {
  RecurringBudgetPage,
  parseRecurringPayload,
  type RecurringFormValues,
} from "@/app/components/recurring-budget-page";
import type { RecurringExpense } from "@/types/recurringBudget";

export default function ExpensesClient({
  initialItems,
}: {
  initialItems: RecurringExpense[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  async function refresh() {
    router.refresh();
    const res = await fetch("/api/recurring-expenses");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }

  return (
    <RecurringBudgetPage
      title="Recurring Expenses"
      description="Predicted monthly outgoings like rent and groceries. These pre-fill each month's outgoings in your planner."
      icon={<ReceiptIcon className="text-rose-500" />}
      accentClass="bg-rose-100"
      buttonClass="bg-rose-500 hover:bg-rose-600"
      items={items}
      onAdd={async (values: RecurringFormValues) => {
        const res = await fetch("/api/recurring-expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parseRecurringPayload(values)),
        });
        if (!res.ok) throw new Error("Failed to add expense");
        await refresh();
      }}
      onUpdate={async (id, values) => {
        const res = await fetch("/api/recurring-expenses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...parseRecurringPayload(values) }),
        });
        if (!res.ok) throw new Error("Failed to update expense");
        await refresh();
      }}
      onDelete={async (id) => {
        const res = await fetch(`/api/recurring-expenses?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete expense");
        await refresh();
      }}
    />
  );
}
