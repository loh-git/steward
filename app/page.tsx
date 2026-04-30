import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {user ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Hello, {user.email}!
          </h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Dashboard
          </Link>
        </>
      ) : (
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
      )}
    </div>
  );
}
