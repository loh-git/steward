"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAuthUserId } from "@/utils/supabase/financial-profile";
import { createClient } from "@/utils/supabase/server";
import {
  monthIndex,
  monthIndexToYearMonth,
} from "@/utils/monthly/merge-recurring";
import type { FinancialProfilePayload } from "@/types/financialProfile";
import type { LogSalaryChangeInput } from "@/types/salaryHistory";

export async function logSalaryChange(input: LogSalaryChangeInput) {
  const userId = await requireAuthUserId();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const now = new Date();
  const effectiveYear = input.effectiveYear ?? now.getFullYear();
  const effectiveMonth = input.effectiveMonth ?? now.getMonth() + 1;
  const effectiveIdx = monthIndex(effectiveYear, effectiveMonth);

  const { data: financial, error: fetchError } = await supabase
    .from("financial_profiles")
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !financial?.payload) {
    throw new Error("No existing financial profile to base this change on.");
  }

  const current = financial.payload as FinancialProfilePayload;

  const { data: lastChange, error: lastChangeError } = await supabase
    .from("salary_changes")
    .select("ends_until_year, ends_until_month")
    .eq("user_id", userId)
    .order("ends_until_year", { ascending: false })
    .order("ends_until_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastChangeError) {
    throw new Error(lastChangeError.message);
  }

  const endsIdx = effectiveIdx - 1;

  let shouldArchive = true;
  let effectiveFrom: { year: number; month: number } | null = null;

  if (lastChange) {
    const lastEndsIdx = monthIndex(
      lastChange.ends_until_year,
      lastChange.ends_until_month,
    );

    if (endsIdx < lastEndsIdx) {
      throw new Error(
        "This change would overlap or precede an already-logged change. Salary history must be logged in chronological order.",
      );
    }

    if (endsIdx === lastEndsIdx) {
      // The new change takes effect the very next month after the last logged
      // one ended — there's no distinct outgoing period left to archive.
      shouldArchive = false;
    } else {
      const chained = monthIndexToYearMonth(lastEndsIdx + 1);
      effectiveFrom = chained;
    }
  }

  if (shouldArchive) {
    const ends = monthIndexToYearMonth(endsIdx);
    const { error: insertError } = await supabase.from("salary_changes").insert({
      user_id: userId,
      annual_income: current.financialInfo.annualIncome,
      tax_code: current.financialInfo.taxCode,
      pension: current.financialInfo.pension,
      effective_from_year: effectiveFrom?.year ?? null,
      effective_from_month: effectiveFrom?.month ?? null,
      ends_until_year: ends.year,
      ends_until_month: ends.month,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const updatedPayload: FinancialProfilePayload = {
    ...current,
    financialInfo: {
      ...current.financialInfo,
      annualIncome: input.annualIncome,
      taxCode: input.taxCode ?? current.financialInfo.taxCode,
      pension: input.pension ?? current.financialInfo.pension,
    },
  };

  const { error: updateError } = await supabase.from("financial_profiles").upsert(
    {
      user_id: userId,
      tax_year: updatedPayload.financialInfo.taxYear,
      payload: updatedPayload,
    },
    { onConflict: "user_id" },
  );

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
