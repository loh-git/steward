import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { RecurringExpense } from "@/types/recurringExpenses";

function rowToExpense(row: Record<string, unknown>): RecurringExpense {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: Number(row.amount),
    intervalMonths: row.interval_months != null ? Number(row.interval_months) : 1,
    startsFromYear:
      row.starts_from_year != null ? Number(row.starts_from_year) : null,
    startsFromMonth:
      row.starts_from_month != null ? Number(row.starts_from_month) : null,
    endsUntilYear:
      row.ends_until_year != null ? Number(row.ends_until_year) : null,
    endsUntilMonth:
      row.ends_until_month != null ? Number(row.ends_until_month) : null,
    createdAt: String(row.created_at),
  };
}

async function getUserId() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function GET() {
  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: (data ?? []).map(rowToExpense),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.label || body.amount == null) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recurring_expenses")
    .insert({
      user_id: userId,
      label: body.label,
      amount: Number(body.amount),
      interval_months: body.intervalMonths && body.intervalMonths > 1 ? Number(body.intervalMonths) : 1,
      starts_from_year: body.startsFromYear ?? null,
      starts_from_month: body.startsFromMonth ?? null,
      ends_until_year: body.endsUntilYear ?? null,
      ends_until_month: body.endsUntilMonth ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: rowToExpense(data) });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.label || body.amount == null) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recurring_expenses")
    .update({
      label: body.label,
      amount: Number(body.amount),
      interval_months: body.intervalMonths && body.intervalMonths > 1 ? Number(body.intervalMonths) : 1,
      starts_from_year: body.startsFromYear ?? null,
      starts_from_month: body.startsFromMonth ?? null,
      ends_until_year: body.endsUntilYear ?? null,
      ends_until_month: body.endsUntilMonth ?? null,
    })
    .eq("id", body.id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: rowToExpense(data) });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
