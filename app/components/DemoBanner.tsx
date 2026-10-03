"use client";

import Link from "next/link";
import { useIsDemoUser } from "@/utils/demo/use-is-demo";

// Slim strip under the header for demo visitors, so it's always clear the data is fictional.
export function DemoBanner() {
  const isDemo = useIsDemoUser();
  if (!isDemo) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-brass-200 bg-brass-50 px-4 text-sm text-brass-800 sm:px-6"
    >
      <p className="py-2">
        <span className="font-bold">Demo mode</span>
        <span className="hidden sm:inline"> · sample data only</span>
      </p>
      <Link
        href="/auth/register"
        className="flex min-h-9 items-center font-bold underline underline-offset-2 hover:text-brass-900"
      >
        Create account
      </Link>
    </div>
  );
}
