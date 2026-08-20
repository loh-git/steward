import {
  monthIndex,
  monthIndexToYearMonth,
  appliesToMonth,
} from "@/utils/monthly/merge-recurring";
import type { MonthlyEntry } from "@/types/monthlyPlan";
import type { InterestFrequency } from "@/types/savingsGoals";

// Deliberately not the full SavingsGoal type — mirrors appliesToMonth's own
// convention of taking the minimal shape it actually needs, so this is callable
// with either a real SavingsGoal or RecurringBudgetPage's local item type.
export type ProjectableSavingsGoal = {
  id: string;
  amount: number | null;
  usesVariableAmount?: boolean;
  currentBalance?: number;
  earnsInterest?: boolean;
  interestRate?: number;
  interestFrequency?: InterestFrequency;
  startsFromYear: number | null;
  startsFromMonth: number | null;
  endsUntilYear: number | null;
  endsUntilMonth: number | null;
  createdAt: string;
};

export type SavingsProjectionPoint = {
  year: number;
  month: number;
  contribution: number;
  balance: number;
};

export const DEFAULT_PROJECTION_HORIZON_MONTHS = 24;

// Purely defensive ceiling so a garbage/typo'd end date can never make the
// loop run unbounded. Never hit in normal use.
const HARD_SAFETY_CAP_MONTHS = 1200;

function findGoalOverride(
  entriesByMonth: Map<number, MonthlyEntry>,
  goalId: string,
  year: number,
  month: number,
): number | null {
  const entry = entriesByMonth.get(monthIndex(year, month));
  if (!entry) return null;
  // Same predicate mergeMonthlyEntry's overridesByGoal uses: tagged with this
  // goal's id, but not one of the auto-generated "savings-goal-" lines.
  const override = entry.savings.find(
    (s) => s.savingsGoalId === goalId && !s.id.startsWith("savings-goal-"),
  );
  return override ? override.amount : null;
}

/**
 * Simulates a savings goal's balance forward, month by month, from
 * (startYear, startMonth) through its own end date — or a capped horizon
 * (maxMonths) if it has no end date. Uses real per-month overrides already
 * saved in monthlyEntries where they exist, falling back to the goal's flat
 * default amount otherwise.
 */
export function projectSavingsGoalBalance(
  goal: ProjectableSavingsGoal,
  monthlyEntries: MonthlyEntry[],
  startYear: number,
  startMonth: number,
  maxMonths: number = DEFAULT_PROJECTION_HORIZON_MONTHS,
): SavingsProjectionPoint[] {
  const startIdx = monthIndex(startYear, startMonth);

  const hasEndDate = goal.endsUntilYear != null && goal.endsUntilMonth != null;
  const endIdx = hasEndDate
    ? monthIndex(goal.endsUntilYear as number, goal.endsUntilMonth as number)
    : startIdx + maxMonths - 1;

  // Goal already ended (or endsUntil is before "now") — nothing to project.
  if (endIdx < startIdx) return [];

  const cappedEndIdx = Math.min(endIdx, startIdx + HARD_SAFETY_CAP_MONTHS - 1);

  const entriesByMonth = new Map(
    monthlyEntries.map((e) => [monthIndex(e.year, e.month), e]),
  );

  const points: SavingsProjectionPoint[] = [];
  let balance = goal.currentBalance ?? 0;

  for (let idx = startIdx, i = 1; idx <= cappedEndIdx; idx++, i++) {
    const { year, month } = monthIndexToYearMonth(idx);

    let contribution = 0;
    if (appliesToMonth(goal, year, month)) {
      const override = findGoalOverride(entriesByMonth, goal.id, year, month);
      contribution = override ?? goal.amount ?? 0;
    }

    balance += contribution;

    // Interest compounds regardless of whether a contribution landed this
    // month — a balance already sitting in the account keeps earning it.
    // Skipped on the very first point (i === 1): currentBalance is a snapshot
    // as of right now, so no time has passed yet to have earned anything —
    // growth only starts showing up from the following month onward.
    if (goal.earnsInterest && i > 1) {
      const rate = (goal.interestRate ?? 0) / 100;
      if (goal.interestFrequency === "monthly") {
        balance *= 1 + rate / 12;
      } else if (i % 12 === 0) {
        // "annually" — a single lump step every 12th month of the
        // projection itself; no real calendar anniversary is tracked.
        balance *= 1 + rate;
      }
    }

    points.push({ year, month, contribution, balance });
  }

  return points;
}
