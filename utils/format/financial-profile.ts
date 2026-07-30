import type { FinancialInfo } from "@/types/financialProfile";
import { formatGBP } from "@/utils/format/currency";

const LOAN_LABELS: Record<string, string> = {
  plan1: "Plan 1",
  plan2: "Plan 2",
  plan4Scotland: "Plan 4 (Scotland)",
  plan5: "Plan 5",
  postgraduate: "Postgraduate",
};

export function formatStudentLoans(plans: Record<string, boolean>): string {
  const active = Object.entries(plans)
    .filter(([, on]) => on)
    .map(([key]) => LOAN_LABELS[key] ?? key);
  return active.length ? active.join(", ") : "None selected";
}

export function pensionLabel(fi: FinancialInfo): string {
  const scheme =
    fi.pension.scheme === "auto-enrolment"
      ? "Pension auto-enrolment"
      : `Pension ${fi.pension.scheme}`;
  const value =
    fi.pension.type === "percentage"
      ? `${fi.pension.value}%`
      : `${formatGBP(fi.pension.value)}/mo`;
  const qualifying = fi.pension.basedOnQualifyingEarnings
    ? " (qualifying)"
    : "";
  return `${scheme}: ${value}${qualifying}`;
}
