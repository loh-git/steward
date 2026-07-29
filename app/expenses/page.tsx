import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { RecurringExpense } from "@/types/recurringExpenses";
import ExpensesClient from "./expenses-client";

function mapRow(row: Record<string, unknown>): RecurringExpense {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: Number(row.amount),
    startsFromYear:
      row.starts_from_year != null ? Number(row.starts_from_year) : null,
    startsFromMonth:
      row.starts_from_month != null ? Number(row.starts_from_month) : null,
    endsUntilYear:
      row.ends_until_year != null ? Number(row.ends_until_year) : null,
    endsUntilMonth:
      row.ends_until_month != null ? Number(row.ends_until_month) : null,
    createdAt: String(row.created_at),
  };
}

export default async function ExpensesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <ExpensesClient initialItems={(data ?? []).map(mapRow)} />;
}
