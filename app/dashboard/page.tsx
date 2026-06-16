import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loadFinancialProfile } from "@/lib/supabase/financial-profile";
import { createClient } from "@/utils/supabase/server";
import { calculateTakeHome } from "@/lib/take-home/calculate";
import TakeHomeCard from "./components/take-home-card";
import MonthGrid from "./components/month-grid";

export default async function Dashboard() {
  const input = await loadFinancialProfile();

  // Ensure user is authenticated for dashboard data
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch monthly entries for the current year to drive MonthGrid
  const currentYear = new Date().getFullYear();
  const { data: monthsRows } = await supabase
    .from("monthly_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", currentYear);

  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const row = (monthsRows || []).find((r: any) => r.month === i + 1);
    return (
      row || {
        month: i + 1,
        year: currentYear,
        incomes: [],
        expenditures: [],
      }
    );
  });

  // Treat an existing financial profile (even with `annualIncome` === 0)
  // as "set up". Only show setup CTA when no profile at all exists.
  if (!input) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Financial Data
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Complete the setup form to save your financial profile and see
            take-home estimates.
          </p>
          <a
            href="/setup"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  const { financialInfo: fi, userInfo } = input;
  const takeHome = calculateTakeHome(fi);
  const activeLoanPlans = Object.entries(fi.studentLoanPlan)
    .filter(([, on]) => on)
    .map(([plan]) => plan);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-500">
              Welcome back {userInfo.firstName}
            </p>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Profile: set up
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Name:</span>{" "}
                <span className="font-medium">
                  {userInfo.firstName} {userInfo.lastName}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Gross salary:</span>{" "}
                <span className="font-medium">
                  £{fi.annualIncome.toLocaleString()} / year
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Tax year:</span>{" "}
                <span className="font-medium">{fi.taxYear}</span>
              </div>
              <div>
                <span className="text-zinc-500">Region:</span>{" "}
                <span className="font-medium">
                  {fi.residentInScotland ? "Scotland" : "England, Wales & NI"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Tax code:</span>{" "}
                <span className="font-medium">{fi.taxCode || "Default"}</span>
              </div>
              <div>
                <span className="text-zinc-500">Pension:</span>{" "}
                <span className="font-medium">
                  {fi.pension.value}
                  {fi.pension.type === "percentage" ? "%" : "£/mo"} (
                  {fi.pension.scheme})
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500">Student loans:</span>{" "}
                <span className="font-medium">
                  {activeLoanPlans.length
                    ? activeLoanPlans.join(", ")
                    : "None selected"}
                </span>
              </div>
            </div>
          </div>

          <TakeHomeCard result={takeHome} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Yearly months</h2>
          <MonthGrid
            initialYear={new Date().getFullYear()}
            monthsData={[]}
            defaultMonthly={Math.round(takeHome.netMonthly)}
          />
        </div>
      </div>
    </div>
  );
}
