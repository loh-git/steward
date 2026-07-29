import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { calculateTakeHome } from "@/utils/take-home/calculate";
import type { FinancialInfo } from "@/types/financialProfile";
import SettingsClient from "./settings-client";

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

  // Was previously annualIncome / 12 — gross salary with no tax, NI, pension, or
  // student loan deductions applied, so it wasn't take-home pay at all. Run it
  // through the same calculateTakeHome the dashboard uses instead.
  const financialInfo = financial?.payload?.financialInfo as
    | FinancialInfo
    | undefined;
  const monthly = financialInfo?.annualIncome
    ? Math.round(calculateTakeHome(financialInfo).netMonthly)
    : null;

  return (
    <SettingsClient
      userEmail={user?.email ?? "-"}
      profileName={`${profile?.first_name ?? "-"} ${profile?.last_name ?? ""}`.trim()}
      monthlyTakeHome={monthly}
      hasFinancialProfile={Boolean(financial)}
    />
  );
}
