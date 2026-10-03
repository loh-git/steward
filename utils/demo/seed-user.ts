import type { createClient } from "@/utils/supabase/server";
import {
  buildDemoSeed,
  materializeMonthlyRows,
} from "@/utils/demo/seed";

type ServerSupabase = ReturnType<typeof createClient>;

// Every Supabase call returns { error } rather than throwing; this turns a failure into
// one exception naming the step so the Server Action can log it once and show a friendly message.
function check(step: string, error: { message: string } | null) {
  if (error) throw new Error(`demo seed (${step}): ${error.message}`);
}

/**
 * The monthly_entries write is the last step of seedDemoUser, so a row existing means the
 * whole seed finished. Covers a double-click, a second tab, or a returning visitor.
 */
export async function isDemoSeeded(
  supabase: ServerSupabase,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("monthly_entries")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  check("check seeded", error);
  return (data?.length ?? 0) > 0;
}

/**
 * Fills the signed-in user's own rows with the sample dataset. Runs as the user (no service-role
 * key), so the existing `auth.uid() = user_id` RLS policies are what allow every write.
 * Child rows are cleared first so a retry after a half-finished seed never duplicates anything.
 */
export async function seedDemoUser(
  supabase: ServerSupabase,
  userId: string,
  now: Date,
): Promise<void> {
  const seed = buildDemoSeed(now);

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...seed.profile }, { onConflict: "id" });
  check("profile", profileError);

  const cleared = await Promise.all([
    supabase.from("recurring_expenses").delete().eq("user_id", userId),
    supabase.from("savings_goals").delete().eq("user_id", userId),
    supabase.from("salary_changes").delete().eq("user_id", userId),
  ]);
  check("clear old rows", cleared.find((r) => r.error)?.error ?? null);

  const [financial, recurring, goals, salary] = await Promise.all([
    supabase.from("financial_profiles").upsert(
      {
        user_id: userId,
        tax_year: seed.taxYear,
        payload: { ...seed.financialPayload, id: userId },
      },
      { onConflict: "user_id" },
    ),
    supabase
      .from("recurring_expenses")
      .insert(seed.recurringExpenses.map((r) => ({ user_id: userId, ...r })))
      .select("id,label"),
    supabase
      .from("savings_goals")
      .insert(seed.savingsGoals.map((g) => ({ user_id: userId, ...g })))
      .select("id,label"),
    supabase
      .from("salary_changes")
      .insert(seed.salaryChanges.map((c) => ({ user_id: userId, ...c }))),
  ]);
  check("financial profile", financial.error);
  check("recurring expenses", recurring.error);
  check("savings goals", goals.error);
  check("salary history", salary.error);

  // Overrides must point at the real parent ids, so they can only be built now.
  const toIdMap = (rows: { id: string; label: string }[] | null) =>
    new Map((rows ?? []).map((r) => [r.label, r.id]));
  const rows = materializeMonthlyRows(
    seed.months,
    { recurring: toIdMap(recurring.data), goals: toIdMap(goals.data) },
    userId,
  );

  const { error: monthsError } = await supabase
    .from("monthly_entries")
    .upsert(rows, { onConflict: "user_id,year,month" });
  check("monthly entries", monthsError);
}
