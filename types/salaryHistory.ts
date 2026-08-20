import type { PensionContribution } from "@/types/financialProfile";

// A closed historical window: the annualIncome/taxCode/pension that applied
// BEFORE the change that ended this window. Never represents "now" — the live
// financial profile always holds the current/going-forward values.
export type SalaryChange = {
  id: string;
  annualIncome: number;
  taxCode: string;
  pension: PensionContribution;
  effectiveFromYear: number | null;
  effectiveFromMonth: number | null;
  endsUntilYear: number;
  endsUntilMonth: number;
  createdAt: string;
};

export type LogSalaryChangeInput = {
  annualIncome: number;
  taxCode?: string;
  pension?: PensionContribution;
  effectiveYear?: number;
  effectiveMonth?: number;
};
