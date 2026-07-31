import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loadFinancialProfile } from "@/utils/supabase/financial-profile";
import { createClient } from "@/utils/supabase/server";
import {
  calculateTakeHome,
  getAdjustedPayDateForMonth,
} from "@/utils/take-home/calculate";
import type { MonthlyEntry } from "@/types/monthlyPlan";
import type { SavingsGoal } from "@/types/savingsGoals";
import { RecurringExpense } from "@/types/recurringExpenses";
import DashboardClient from "./components/dashboard-client";

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

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const input = await loadFinancialProfile();

  if (!input) {
    return (
      <div className="min-h-screen bg-paper-canvas p-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-ink-900">
            No Financial Data
          </h1>
          <p className="mb-6 text-ink-600">
            Complete the setup form to save your financial profile and see
            take-home estimates.
          </p>
          <a
            href="/setup"
            className="rounded bg-ledger-600 px-4 py-2 text-white hover:bg-ledger-700"
          >
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  const [{ data: monthsRows }, { data: recurringRows }, { data: savingsRows }] =
    await Promise.all([
      supabase
        .from("monthly_entries")
        .select("year, month, take_home_salary, incomes, expenditures, savings")
        .eq("user_id", user.id),
      supabase.from("recurring_expenses").select("*").eq("user_id", user.id),
      supabase.from("savings_goals").select("*").eq("user_id", user.id),
    ]);

  const allMonths = parseAllMonthlyRows(monthsRows ?? []);
  const { financialInfo: fi, userInfo } = input;
  const takeHome = calculateTakeHome(fi);
  const baseNetMonthly = Math.round(takeHome.netMonthly);
  const today = new Date();
  const payDate = getAdjustedPayDateForMonth(
    today.getFullYear(),
    today.getMonth() + 1,
    fi.payDate?.dayOfMonth ?? null,
  );
  const currentMonthPay = {
    amount: takeHome.netMonthly,
    payDateLabel: payDate
      ? payDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Set your pay date",
  };

  return (
    <DashboardClient
      firstName={userInfo.firstName || "there"}
      takeHome={takeHome}
      initialYear={currentYear}
      initialMonthsData={allMonths}
      recurringExpenses={(recurringRows ?? []).map(mapRecurring)}
      savingsGoals={(savingsRows ?? []).map(mapSavingsGoal)}
      baseNetMonthly={baseNetMonthly}
      currentMonthPay={currentMonthPay}
    />
  );
}
