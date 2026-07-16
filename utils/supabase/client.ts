/**
 *  Supabase client for browser usage. This is a wrapper around the
 *  Supabase client that is configured to use the browser's fetch API
 *  and the Supabase URL and key from environment variables.
 *
 *  We use this whenever we need to access Supabase from the client side
 *  (e.g., in React components, not server-side).
 */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
