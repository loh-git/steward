"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FINANCIAL_INPUT_COOKIE,
  requireAuthUserId,
} from "@/lib/supabase/financial-profile";
import { createClient } from "@/utils/supabase/server";
import type { FinancialProfilePayload } from "./types";

export async function saveFinancialProfile(payload: FinancialProfilePayload) {
  const userId = await requireAuthUserId();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const userRes = await supabase.auth.getUser();
    console.debug("saveFinancialProfile: supabase.auth.getUser() ->", userRes);
  } catch (e) {
    console.debug(
      "saveFinancialProfile: failed to call supabase.auth.getUser()",
      e,
    );
  }

  const normalized: FinancialProfilePayload = {
    ...payload,
    id: userId,
  };

  console.debug("saveFinancialProfile: normalized payload", {
    normalized,
    userId,
  });

  const profileUpsert = {
    id: userId,
    first_name: normalized.userInfo.firstName,
    last_name: normalized.userInfo.lastName,
    date_of_birth: normalized.userInfo.dob || null,
  };

  console.debug("saveFinancialProfile: upserting profile", { profileUpsert });

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profileUpsert, { onConflict: "id" });

  if (profileError) {
    console.error("Error upserting profile:", profileError);
    // Strict RLS: surface a clear error to help debugging RLS policies and session context
    if (
      (profileError.message || "").toLowerCase().includes("permission denied")
    ) {
      throw new Error(
        "Permission denied when saving profile. Ensure Row Level Security policies allow the authenticated user to insert/update and that the server request presents the user's session cookie (auth.uid()).",
      );
    }

    const message =
      profileError.message || "Failed to save personal information";
    throw new Error(message);
  }

  const { error: financialError } = await supabase
    .from("financial_profiles")
    .upsert(
      {
        user_id: userId,
        tax_year: normalized.financialInfo.taxYear,
        payload: normalized,
      },
      { onConflict: "user_id" },
    );

  if (financialError) {
    console.error("Error upserting financial profile:", financialError);
    throw new Error("Failed to save financial information");
  }

  cookieStore.set(FINANCIAL_INPUT_COOKIE, JSON.stringify(normalized), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/dashboard");
  revalidatePath("/setup");
  redirect("/dashboard");
}
