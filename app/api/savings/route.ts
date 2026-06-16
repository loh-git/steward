import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  const { id, name, monthly_amount, start_year, start_month, end_year, end_month, current_balance } = body;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const userRes = await supabase.auth.getUser();
  const userId = userRes?.data?.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

  const payload: any = {
    user_id: userId,
    name,
    monthly_amount: monthly_amount ?? 0,
    start_year,
    start_month,
    end_year: end_year ?? null,
    end_month: end_month ?? null,
    current_balance: current_balance ?? 0,
  };

  if (id) payload.id = id;

  const { error } = await supabase.from("savings_items").upsert(payload, { onConflict: "id" });
  if (!error) return NextResponse.json({ ok: true });

  console.error("savings_items upsert error:", error);
  if (error.message && error.message.toLowerCase().includes("permission denied")) {
    return NextResponse.json({ ok: false, error: "permission denied - check RLS policies and that request is authenticated as the user" }, { status: 403 });
  }

  return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
}
