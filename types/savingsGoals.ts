// How often interest is compounded — a rate compounded monthly grows a balance
// faster than the same nominal rate compounded annually.
export type InterestFrequency = "monthly" | "annually";

export const SAVINGS_GOAL_NOTES_MAX_LENGTH = 500;

//  An instance of a savings goal retrieved from BE
export type SavingsGoal = {
  id: string;
  label: string;
  amount: number | null;
  usesVariableAmount: boolean;
  currentBalance: number;
  earnsInterest: boolean;
  interestRate: number;
  interestFrequency: InterestFrequency;
  /** Free-text note, capped at SAVINGS_GOAL_NOTES_MAX_LENGTH characters. */
  notes: string | null;
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
  interestFrequency?: InterestFrequency;
  notes?: string | null;
  startsFromYear?: number | null;
  startsFromMonth?: number | null;
  endsUntilYear?: number | null;
  endsUntilMonth?: number | null;
};
