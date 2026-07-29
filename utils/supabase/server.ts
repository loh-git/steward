// createServerClient is Supabase's helper for building a client that runs on the server
// (as opposed to createBrowserClient, which is what you'd use in client components).
// The whole point of the server variant is that it needs to be told how to read/write
// cookies itself, since it has no access to the browser's document.cookie.
import { createServerClient } from "@supabase/ssr";
// cookies() is Next's server-side accessor for the current request's cookie jar.
// We don't call it in here directly (see the cookieStore param below), we just need
// its return type further down.
import { cookies } from "next/headers";

// Same Supabase project URL used everywhere else (browser client, proxy/middleware, etc.)
// Public env vars (NEXT_PUBLIC_...) are safe to expose since they're inlined into client bundles anyway.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  // process.env.SUPABASE_SERVICE_ROLE_KEY || SHOULDN'T BE USED, TEST
  // ^ left in as a warning: the service role key bypasses Row Level Security entirely,
  // so swapping it in here would let ANY request read/write ANY user's data. The
  // publishable key below is the safe, RLS-respecting choice for this server client.
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Takes cookieStore as argument, cookieStore's type is a Promise that will return an array of cookies.
// This is used to create a Supabase client that can be used on the server side, and can access
// the cookies from the request.
//
// Why cookieStore is passed in rather than this function just calling cookies() itself:
// cookies() behaves differently depending on where you call it from (Server Component,
// Route Handler, Server Action), and callers already need to await it for their own reasons
// in some cases. So instead of this file making its own assumptions, every caller does
// `createClient(await cookies())` (or passes along one they already have) and hands the
// resolved store in. Keeps this function a plain, predictable consumer of the cookie jar.
export const createClient = (
  // Awaited<ReturnType<typeof cookies>> just means "whatever cookies() resolves to,
  // after you've awaited the Promise it returns" — i.e. the actual cookie store object,
  // not the Promise wrapping it.
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  // supabaseUrl! and supabaseKey! use the non-null assertion (!) to tell TypeScript
  // "trust me, these env vars are set" — if they're not, this'll blow up at runtime
  // with a fairly unhelpful Supabase error rather than a friendly missing-env-var one.
  return createServerClient(supabaseUrl!, supabaseKey!, {
    // Supabase doesn't touch cookies directly, it calls out to this cookies object
    // whenever it needs to read the current session or write a refreshed one.
    cookies: {
      // Called whenever Supabase wants to check what's currently in the jar
      // (e.g. to read the existing session/auth token cookies).
      getAll() {
        return cookieStore.getAll();
      },
      // Called whenever Supabase needs to persist something back (e.g. a refreshed
      // auth token after the old one expired). cookiesToSet is an array of
      // { name, value, options } triples Supabase hands us to write out.
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          //
          // In other words: Next only allows *writing* cookies from Server Actions
          // and Route Handlers, not from Server Components (they're read-only, since
          // the response may already be streaming). If createClient() is used inside
          // a Server Component and Supabase tries to refresh the session, cookieStore.set
          // throws here. We swallow it rather than crashing the page, on the assumption
          // that the proxy/middleware (utils/supabase/middleware.ts's updateSession) is
          // already handling session refresh on every request, so a Server Component
          // failing to write cookies isn't actually losing anything.
        }
      },
    },
  });
};
