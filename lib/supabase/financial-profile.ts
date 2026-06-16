import { cookies } from "next/headers";
import type { FinancialProfilePayload } from "@/app/setup/types";
import { createInitialPayload } from "@/app/setup/types";
import { calculateAge } from "@/app/setup/utils";
import type { FinancialProfileRow, ProfileRow } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export const FINANCIAL_INPUT_COOKIE = "financial-input";

function payloadFromProfileRow(
  profile: ProfileRow,
  financial: FinancialProfileRow | null,
): FinancialProfilePayload | null {
  if (financial?.payload && typeof financial.payload === "object") {
    const stored = financial.payload as FinancialProfilePayload;
    return {
      ...stored,
      id: profile.id,
      userInfo: {
        ...stored.userInfo,
        firstName: stored.userInfo.firstName || profile.first_name,
        lastName: stored.userInfo.lastName || profile.last_name,
        dob: stored.userInfo.dob || profile.date_of_birth || "",
        age:
          stored.userInfo.age ||
          calculateAge(stored.userInfo.dob || profile.date_of_birth || ""),
      },
    };
  }

  if (!profile.first_name && !profile.last_name && !profile.date_of_birth) {
    return null;
  }

  const dob = profile.date_of_birth ?? "";
  return {
    ...createInitialPayload(profile.id),
    userInfo: {
      firstName: profile.first_name,
      lastName: profile.last_name,
      dob,
      age: calculateAge(dob),
    },
  };
}

function payloadFromCookie(
  cookieValue: string | undefined,
  userId: string,
): FinancialProfilePayload | null {
  if (!cookieValue) return null;
  try {
    const parsed = JSON.parse(cookieValue) as FinancialProfilePayload;
    return { ...parsed, id: userId };
  } catch {
    return null;
  }
}

/** Load the signed-in user's financial profile (database first, then cookie draft). */
export async function loadFinancialProfile(): Promise<FinancialProfilePayload | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    console.debug("loadFinancialProfile: authenticated user ->", user.id);
  } catch {}

  const [{ data: profile }, { data: financial }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("financial_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  try {
    console.debug("loadFinancialProfile: db profile ->", profile);
    console.debug("loadFinancialProfile: db financial ->", financial);
    console.debug(
      "loadFinancialProfile: cookie draft ->",
      cookieStore.get(FINANCIAL_INPUT_COOKIE)?.value,
    );
  } catch {}

  if (profile) {
    const fromDb = payloadFromProfileRow(
      profile as ProfileRow,
      financial as FinancialProfileRow | null,
    );
    if (fromDb?.financialInfo?.annualIncome) return fromDb;
    if (fromDb) return fromDb;
  }

  return payloadFromCookie(
    cookieStore.get(FINANCIAL_INPUT_COOKIE)?.value,
    user.id,
  );
}

export async function requireAuthUserId(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to save your profile");
  }

  // Debug: log authenticated user id to help diagnose RLS permission issues.
  // This is safe: it only logs the user's id (no tokens). Remove in production once RLS is confirmed.
  try {
    // eslint-disable-next-line no-console
    console.debug("requireAuthUserId: authenticated user id =", user.id);
  } catch (err) {
    /* ignore logging errors */
  }

  return user.id;
}
