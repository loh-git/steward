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
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Steward!
        </h1>
        <div className="mt-6 flex gap-4 col-2">
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-white border-blue-500 border-1 text-blue-500 rounded"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Log In
          </Link>
        </div>
      </>
    </div>
  );
}
