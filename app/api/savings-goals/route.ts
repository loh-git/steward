import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { SavingsGoal } from "@/types/savingsGoals";

function rowToGoal(row: Record<string, unknown>): SavingsGoal {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: row.amount != null ? Number(row.amount) : null,
    usesVariableAmount: Boolean(row.uses_variable_amount),
    currentBalance: Number(row.current_balance ?? 0),
    earnsInterest: Boolean(row.earns_interest),
    interestRate: Number(row.interest_rate ?? 0),
    interestFrequency: row.interest_frequency === "monthly" ? "monthly" : "annually",
    notes: typeof row.notes === "string" ? row.notes : null,
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
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: (data ?? []).map(rowToGoal),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.label || (body.amount == null && !body.usesVariableAmount)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: userId,
      label: body.label,
      amount: body.usesVariableAmount ? null : Number(body.amount),
      uses_variable_amount: Boolean(body.usesVariableAmount),
      current_balance: Number(body.currentBalance ?? 0),
      earns_interest: Boolean(body.earnsInterest),
      interest_rate: Number(body.interestRate ?? 0),
      interest_frequency: body.interestFrequency === "monthly" ? "monthly" : "annually",
      notes:
        typeof body.notes === "string" && body.notes.trim()
          ? body.notes.trim().slice(0, 500)
          : null,
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

  return NextResponse.json({ item: rowToGoal(data) });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (
    !body?.id ||
    !body?.label ||
    (body.amount == null && !body.usesVariableAmount)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .update({
      label: body.label,
      amount: body.usesVariableAmount ? null : Number(body.amount),
      uses_variable_amount: Boolean(body.usesVariableAmount),
      current_balance: Number(body.currentBalance ?? 0),
      earns_interest: Boolean(body.earnsInterest),
      interest_rate: Number(body.interestRate ?? 0),
      interest_frequency: body.interestFrequency === "monthly" ? "monthly" : "annually",
      notes:
        typeof body.notes === "string" && body.notes.trim()
          ? body.notes.trim().slice(0, 500)
          : null,
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

  return NextResponse.json({ item: rowToGoal(data) });
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
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
