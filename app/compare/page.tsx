import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { MonthlyEntry } from "@/types/monthlyPlan";
import type { SavingsGoal } from "@/types/savingsGoals";
import type { RecurringExpense } from "@/types/recurringExpenses";
import CompareClient from "./compare-client";

function parseAllMonthlyRows(
  rows: Array<{
    year: number;
    month: number;
    take_home_salary?: number | null;
    incomes?: unknown;
    expenditures?: unknown;
    savings?: unknown;
  }>,
): MonthlyEntry[] {
  return rows.map((row) => ({
    year: row.year,
    month: row.month,
    takeHomeSalary:
      row.take_home_salary != null ? Number(row.take_home_salary) : null,
    incomes: Array.isArray(row.incomes) ? row.incomes : [],
    expenditures: Array.isArray(row.expenditures) ? row.expenditures : [],
    savings: Array.isArray(row.savings) ? row.savings : [],
  }));
}

function mapRecurring(row: Record<string, unknown>): RecurringExpense {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: Number(row.amount),
    intervalMonths: row.interval_months != null ? Number(row.interval_months) : 1,
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

function mapSavingsGoal(row: Record<string, unknown>): SavingsGoal {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: row.amount != null ? Number(row.amount) : null,
    usesVariableAmount: Boolean(row.uses_variable_amount),
    currentBalance: Number(row.current_balance ?? 0),
    earnsInterest: Boolean(row.earns_interest),
    interestRate: Number(row.interest_rate ?? 0),
    interestFrequency: row.interest_frequency === "monthly" ? "monthly" : "annually",
    notes: typeof row.notes === "string" ? row.notes : null,
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

export default async function ComparePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: monthsRows }, { data: recurringRows }, { data: savingsRows }] =
    await Promise.all([
      supabase
        .from("monthly_entries")
        .select("year, month, take_home_salary, incomes, expenditures, savings")
        .eq("user_id", user.id),
      supabase.from("recurring_expenses").select("*").eq("user_id", user.id),
      supabase.from("savings_goals").select("*").eq("user_id", user.id),
    ]);

  return (
    <CompareClient
      initialMonthsData={parseAllMonthlyRows(monthsRows ?? [])}
      recurringExpenses={(recurringRows ?? []).map(mapRecurring)}
      savingsGoals={(savingsRows ?? []).map(mapSavingsGoal)}
      initialYear={new Date().getFullYear()}
    />
  );
}
