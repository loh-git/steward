// Months of the year
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

// An user-created entry for a month, can be income, expense, savings
// TODO (low priority): consider a free-text note field on line items, similar to
// MonthlyEntry.takeHomeSalaryNote, so a user can record why a particular expense
// looked the way it did that month.
export type BudgetLineItem = {
  id: string;
  label: string;
  amount: number;
  category?: string;
  //  Might want this later
  // planned?: boolean;
  recurringExpenseId?: string;
  savingsGoalId?: string;
};

// The monthly entry is a collection of incomes, expenditures, and savings for a given month and year. It can also have an optional take-home salary override for that month.
export type MonthlyEntry = {
  year: number;
  month: number;
  /** Overrides calculated take-home for this month when set. */
  takeHomeSalary?: number | null;
  /** Optional short note explaining why takeHomeSalary was overridden this month. */
  takeHomeSalaryNote?: string | null;
  incomes: BudgetLineItem[];
  expenditures: BudgetLineItem[];
  savings: BudgetLineItem[];
};

// Delete this after git push so we have record of it
// export const OUTGOING_CATEGORIES = [
//   "Housing",
//   "Utilities",
//   "Groceries",
//   "Transport",
//   "Other",
// ] as const;
 
/**
 * @description Function for creating an empty monthly entry with no incomes, expenditures, or savings.
 * 
 * @param year Year month belongs to (e.g. 2026)
 * @param month Month number (e.g. 1 = January, 12 = December)
 * @returns Empty monthly entry
 */
export function emptyMonthlyEntry(year: number, month: number): MonthlyEntry {
  return {
    year,
    month,
    incomes: [],
    expenditures: [],
    savings: [],
  };
}

/**
 * @description Function for summarising a monthly entry to get the total income, total outgoings, total savings, remaining amount, and base income.
 * @param entry The monthly entry to summarise
 * @param defaultMonthlyIncome
 * @returns An object containing the total income, total outgoings, total savings, remaining amount, and base income for the given monthly entry.
 */
export function summariseMonth(
  entry: MonthlyEntry,
  defaultMonthlyIncome: number,
): {
  totalIncome: number;
  totalOutgoings: number;
  totalSavings: number;
  remaining: number;
  baseIncome: number;
} {
  // baseIncome is either the override or the default monthly income
  const baseIncome = entry.takeHomeSalary ?? defaultMonthlyIncome;
  // extraIncome is the sum of all incomes
  const extraIncome = entry.incomes.reduce((s, i) => s + i.amount, 0);
  // totalIncome is the sum of the base income and extra income
  const totalIncome = baseIncome + extraIncome;
  // totalOutgoings is the sum of all expenditures
  const totalOutgoings = entry.expenditures.reduce((s, e) => s + e.amount, 0);
  // totalSavings is the sum of all savings
  const totalSavings = entry.savings.reduce((s, g) => s + g.amount, 0);
  // remaining is all the money left over (unallocated)
  const remaining = totalIncome - totalOutgoings - totalSavings;
  // return the results as an object to be used elsewhere
  return { totalIncome, totalOutgoings, totalSavings, remaining, baseIncome };
}
