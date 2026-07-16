export type BudgetLineItem = {
  id: string;
  label: string;
  amount: number;
  category?: string;
  planned?: boolean;
  recurringExpenseId?: string;
  savingsGoalId?: string;
};

export type MonthlyEntry = {
  year: number;
  month: number;
  /** Overrides calculated take-home for this month when set. */
  takeHomeSalary?: number | null;
  incomes: BudgetLineItem[];
  expenditures: BudgetLineItem[];
  savings: BudgetLineItem[];
};

export const OUTGOING_CATEGORIES = [
  "Housing",
  "Utilities",
  "Groceries",
  "Transport",
  "Other",
] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function emptyMonthlyEntry(year: number, month: number): MonthlyEntry {
  return {
    year,
    month,
    incomes: [],
    expenditures: [],
    savings: [],
  };
}

export function summariseMonth(
  entry: MonthlyEntry,
  defaultNetMonthly: number,
): {
  totalIncome: number;
  totalOutgoings: number;
  totalSavings: number;
  remaining: number;
  baseIncome: number;
} {
  const baseIncome = entry.takeHomeSalary ?? defaultNetMonthly;
  const extraIncome = entry.incomes.reduce((s, i) => s + i.amount, 0);
  const totalIncome = baseIncome + extraIncome;
  const totalOutgoings = entry.expenditures.reduce((s, e) => s + e.amount, 0);
  const totalSavings = entry.savings.reduce((s, g) => s + g.amount, 0);
  const remaining = totalIncome - totalOutgoings - totalSavings;

  return { totalIncome, totalOutgoings, totalSavings, remaining, baseIncome };
}
