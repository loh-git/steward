//  An instance of a savings goal retrieved from BE
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

// Savings goal input for creating a new savings goal
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
