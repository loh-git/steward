import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

  const monthly = financial?.payload?.financialInfo?.annualIncome
    ? Math.round(financial.payload.financialInfo.annualIncome / 12)
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded shadow space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Profile</h2>
          <p className="mb-2">Name: {profile?.first_name ?? "-"} {profile?.last_name ?? ""}</p>
          <p className="mb-2">Email: {user?.email ?? "-"}</p>
          <p className="mb-4">Estimated monthly take-home: {monthly ? `£${monthly}` : "Not set up"}</p>
          {!monthly && <a href="/setup" className="text-blue-600 hover:underline">Set up take-home salary</a>}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Settings</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Account settings, preferences and connected services (add controls here).</p>
        </section>
      </div>
    </div>
  );
}
