import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { calculateTakeHomeForMonth } from "@/utils/take-home/calculate";
import { formatGBP } from "@/utils/format/currency";
import {
  formatStudentLoans,
  pensionLabel,
} from "@/utils/format/financial-profile";
import type { FinancialInfo } from "@/types/financialProfile";
import type { SalaryChange } from "@/types/salaryHistory";
import SettingsClient from "./settings-client";

function mapSalaryChange(row: Record<string, unknown>): SalaryChange {
  return {
    id: String(row.id),
    annualIncome: Number(row.annual_income),
    taxCode: String(row.tax_code),
    pension: row.pension as SalaryChange["pension"],
    effectiveFromYear:
      row.effective_from_year != null ? Number(row.effective_from_year) : null,
    effectiveFromMonth:
      row.effective_from_month != null ? Number(row.effective_from_month) : null,
    endsUntilYear: Number(row.ends_until_year),
    endsUntilMonth: Number(row.ends_until_month),
    createdAt: String(row.created_at),
  };
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } = {} } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .maybeSingle();
  const { data: financial } = await supabase
    .from("financial_profiles")
    .select("payload")
    .eq("user_id", user?.id)
    .maybeSingle();
  const { data: salaryChangeRows } = await supabase
    .from("salary_changes")
    .select("*")
    .eq("user_id", user?.id)
    .order("ends_until_year", { ascending: false })
    .order("ends_until_month", { ascending: false });

  const salaryChanges = (salaryChangeRows ?? []).map(mapSalaryChange);

  // Was previously annualIncome / 12 — gross salary with no tax, NI, pension, or
  // student loan deductions applied, so it wasn't take-home pay at all. Run it
  // through the same calculateTakeHome the dashboard uses instead.
  const financialInfo = financial?.payload?.financialInfo as
    | FinancialInfo
    | undefined;
  const today = new Date();
  const monthly = financialInfo?.annualIncome
    ? Math.round(
        calculateTakeHomeForMonth(
          financialInfo,
          today.getFullYear(),
          today.getMonth() + 1,
          salaryChanges,
        ).netMonthly,
      )
    : null;

  // Moved here from the dashboard's old profile card, which was replaced by
  // the income/outgoings/savings trend chart.
  const financialDetails = financialInfo
    ? {
        grossSalary: formatGBP(financialInfo.annualIncome),
        taxYear: financialInfo.taxYear,
        region: financialInfo.residentInScotland
          ? "Scotland"
          : "England, Wales & NI",
        taxCode: financialInfo.taxCode?.trim() || "1257L",
        pension: pensionLabel(financialInfo),
        studentLoan: formatStudentLoans(financialInfo.studentLoanPlan),
      }
    : null;

  return (
    <SettingsClient
      userEmail={user?.email ?? "-"}
      profileName={`${profile?.first_name ?? "-"} ${profile?.last_name ?? ""}`.trim()}
      monthlyTakeHome={monthly}
      hasFinancialProfile={Boolean(financial)}
      financialDetails={financialDetails}
      salaryChanges={salaryChanges}
    />
  );
}
