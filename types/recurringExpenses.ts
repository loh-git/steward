// A recurring expense retrieved from BE
export type RecurringExpense = {
  id: string;
  label: string;
  amount: number;
  /** Recurs every N months, anchored to startsFrom (or createdAt if unset). 1 = every month. */
  intervalMonths: number;
  startsFromYear: number | null;
  startsFromMonth: number | null;
  endsUntilYear: number | null;
  endsUntilMonth: number | null;
  createdAt: string;
};

// Recurring expense input for creating a new recurring expense
export type RecurringExpenseInput = {
  label: string;
  amount: number;
  intervalMonths?: number;
  startsFromYear?: number | null;
  startsFromMonth?: number | null;
  endsUntilYear?: number | null;
  endsUntilMonth?: number | null;
};
