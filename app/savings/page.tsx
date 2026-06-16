import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SavingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } = {} } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("savings_items")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Savings</h1>
        {!items || items.length === 0 ? (
          <p className="text-zinc-600">You have no savings items yet. Add one from the dashboard.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it: any) => (
              <div key={it.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-zinc-500">£{Number(it.current_balance ?? 0).toFixed(2)} saved · £{Number(it.monthly_amount ?? 0).toFixed(2)} / month</div>
                </div>
                <div className="text-sm text-zinc-500">From {it.start_month}/{it.start_year} {it.end_month ? `until ${it.end_month}/${it.end_year}` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
