import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { SavingsGoal } from "@/types/savingsGoals";
import SavingsClient from "./savings-client";

function mapRow(row: Record<string, unknown>): SavingsGoal {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: row.amount != null ? Number(row.amount) : null,
    usesVariableAmount: Boolean(row.uses_variable_amount),
    currentBalance: Number(row.current_balance ?? 0),
    earnsInterest: Boolean(row.earns_interest),
    interestRate: Number(row.interest_rate ?? 0),
    startsFromYear:
      row.starts_from_year != null ? Number(row.starts_from_year) : null,
    startsFromMonth:
      row.starts_from_month != null ? Number(row.starts_from_month) : null,
    endsUntilYear:
      row.ends_until_year != null ? Number(row.ends_until_year) : null,
    endsUntilMonth:
      row.ends_until_month != null ? Number(row.ends_until_month) : null,
    createdAt: String(row.created_at),
  };
}

export default async function SavingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <SavingsClient initialItems={(data ?? []).map(mapRow)} />;
}
