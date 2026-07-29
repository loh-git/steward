// A recurring expense retrieved from BE
export type RecurringExpense = {
  id: string;
  label: string;
  amount: number;
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
  startsFromYear?: number | null;
  startsFromMonth?: number | null;
  endsUntilYear?: number | null;
  endsUntilMonth?: number | null;
};
