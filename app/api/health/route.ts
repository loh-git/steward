import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export async function GET() {
  try {
    // provide minimal cookie helpers so createServerClient doesn't throw
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* no-op */
        },
      },
    } as any);

    // lightweight call: get public service health via auth.getSession
    const { error } = await supabase.auth.getSession();
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      { ok: false, error: "connection" },
      { status: 503 },
    );
  }
}
