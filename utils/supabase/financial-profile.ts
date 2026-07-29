import { cookies } from "next/headers";
import type { FinancialProfilePayload } from "@/types/financialProfile";
import { createInitialPayload } from "@/app/setup/utils";
import { calculateAge } from "@/app/setup/utils";
import type { FinancialProfileRow, ProfileRow } from "@/types/user";
import { createClient } from "@/utils/supabase/server";

export const FINANCIAL_INPUT_COOKIE = "financial-input";

// Function that takes a profile row and a financial profile row and returns a FinancialProfilePayload object, or null if no data is available.
function payloadFromProfileRow(
  // TODO: Could these be better named?
  profile: ProfileRow, // Profile row from Supabase (USER INFO)
  financial: FinancialProfileRow | null, // Financial profile row from Supabase (FINANCIAL PROFILE DATA)
  // Returns Financial profile payload to be used in the app, or null if no data is available
): FinancialProfilePayload | null {
  // If the profile doesn't have a first name, last name or DOB, return null
  if (!profile.first_name && !profile.last_name && !profile.date_of_birth) {
    return null;
  }
  /**
 * Example profile: 
 
{
  "id": "85155989-7b72-4eb4-8539-6541ff60e498",
  "first_name": "Test30",
  "last_name": "Tester",
  "age": null,
  "created_at": "2026-06-11T12:06:30.257586+00:00",
  "date_of_birth": "1996-09-10"
}

*/

  /** Example financial:
{
  "id": "3a4962dc-...",           // the row's own identity
  "user_id": "85155989-...",      // which user this belongs to
  "tax_year": "2026/27",          // which tax year this applies to

  // THE ACTUAL DATA ITSELF
  "payload": {
    "id": "85155989-7b72-4eb4-8539-6541ff60e498",
    "userInfo": {
      "age": 29,
      "dob": "1996-09-10",
      "lastName": "Tester",
      "firstName": "Test30"
    },
    "financialInfo": {
      "bonus": {
        "amount": 0,
        "normalPayPeriod": "monthly"
      },
      "payDate": {
        "dayOfMonth": 27
      },
      [...]

**/

  // If this function has been passed the financial profile payload (DATA) and that payload (DATA) is indeed an object
  if (financial?.payload && typeof financial.payload === "object") {
    // stored = the payload typed as a Financial Profile Payload, we did this because
    // the Supabase query returns a generic object type, so we need to cast it to the correct type.
    // otherwise TypeScript will complain that we can't access properties on a generic object type.
    const stored = financial.payload as FinancialProfilePayload;

    return {
      ...stored, // spread the existing financial profile data
      id: profile.id, // append the user's id
      // append the user's info
      userInfo: {
        // spread what we already have from the financial profile data, but override with the user's info from the profile row if it's missing
        ...stored.userInfo,
        // overrides below
        firstName: stored.userInfo.firstName || profile.first_name,
        lastName: stored.userInfo.lastName || profile.last_name,
        dob: stored.userInfo.dob || profile.date_of_birth || "",
        // here we say age is either the age from the stored financial profile data, or if that's missing,
        // we calculate it from the date of birth (from either the stored data or the profile row) or fallback to empty string
        age:
          stored.userInfo.age ||
          calculateAge(stored.userInfo.dob || profile.date_of_birth || ""),
      },
    };
  }

  // Set dob to date of birth defined in profile data
  const dob = profile.date_of_birth ?? "";
  // We reach here if we don't have financial profile data
  // So we create one
  return {
    // Create intial payload (default, more or less empty paylaod)
    ...createInitialPayload(profile.id),
    // Append required user information
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

/** Load the signed-in user's financial profile */
export async function loadFinancialProfile(): Promise<FinancialProfilePayload | null> {
  // Make client request to Supabase to get the authenticated user and their financial profile data.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Destructure the results of the two queries into `profile` and `financial`. Use `maybeSingle()` to avoid errors if no rows are found.
  // maybeSingle is a function from Supabase that returns either a single row or null if no rows are found, instead of throwing an error.
  const [{ data: profile }, { data: financial }] = await Promise.all([
    // Query profiles table for user's profile row using their user id.
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    // Query financial_profiles table for user's financial profile row using their user id.
    supabase
      .from("financial_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(), // Returns null if nothing found instead of throwing error
  ]);

  // If we have found a profile
  if (profile) {
    //
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
