// Server-side component as its simple and doesn't need to be client-side. It also needs to redirect if the user is logged in, pre-rendering
// prevents user even seeing a flash of this page fi they are logged in.
// Put simply, this page is only for unauthenticated users, and if they are authenticated, they should be redirected to the dashboard.

/**
 * EXPO:
 *
 */

import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Receive cookies from client request, and pass them to the Supabase client so it can read the session cookie and determine if the user is logged in.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If they are already logged in, redirect them straight to the dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Render simple register/login page
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-paper-canvas font-sans">
      <>
        <h1 className="font-display text-4xl font-bold text-ink-900">
          Welcome to Steward!
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          UK take-home pay, budgeted properly.
        </p>
        <div className="col-2 mt-6 flex gap-4">
          <Link
            href="/auth/register"
            className="rounded border border-ledger-500 bg-paper-card px-4 py-2 text-ledger-600 hover:bg-ledger-50"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            className="rounded bg-ledger-600 px-4 py-2 text-white hover:bg-ledger-700"
          >
            Log In
          </Link>
        </div>
      </>
    </div>
  );
}
