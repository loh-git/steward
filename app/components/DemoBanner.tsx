import Link from "next/link";

// Slim strip under the header for demo visitors, so it's always clear the data is fictional.
// Rendered by LayoutWrapper only for demo sessions; the server decides, so it's in the first
// paint and doesn't shift the page.
export function DemoBanner() {
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
