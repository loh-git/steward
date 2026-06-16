import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  const { year, month, incomes = [], expenditures = [] } = body;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const userRes = await supabase.auth.getUser();
  const userId = userRes?.data?.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

  const payload = { user_id: userId, year, month, incomes, expenditures };

  const { error } = await supabase.from("monthly_entries").upsert(payload, { onConflict: "user_id,year,month" });
  if (!error) return NextResponse.json({ ok: true });

  console.error("monthly_entries upsert error:", error);
  if (error.message && error.message.toLowerCase().includes("permission denied")) {
    return NextResponse.json({ ok: false, error: "permission denied - check RLS policies and that request is authenticated as the user" }, { status: 403 });
  }

  return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
}
