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

export type SavingsGoal = {
  id: string;
  label: string;
  amount: number | null;
  usesVariableAmount: boolean;
  currentBalance: number;
  earnsInterest: boolean;
  interestRate: number;
  startsFromYear: number | null;
  startsFromMonth: number | null;
  endsUntilYear: number | null;
  endsUntilMonth: number | null;
  createdAt: string;
};

export type RecurringExpenseInput = {
  label: string;
  amount: number;
  startsFromYear?: number | null;
  startsFromMonth?: number | null;
  endsUntilYear?: number | null;
  endsUntilMonth?: number | null;
};

export type SavingsGoalInput = {
  label: string;
  amount?: number | null;
  usesVariableAmount?: boolean;
  currentBalance?: number;
  earnsInterest?: boolean;
  interestRate?: number;
  startsFromYear?: number | null;
  startsFromMonth?: number | null;
  endsUntilYear?: number | null;
  endsUntilMonth?: number | null;
};
