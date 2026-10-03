import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// True when the request belongs to an anonymous (demo) session. Used for the banner and the
// Exit demo label, so it must be known on the server: working it out in the browser made the
// banner pop in after load and push the whole page down. getClaims() verifies the JWT locally
// (no extra round trip) and the flag is cosmetic only, never an access check.
export async function isDemoSession(): Promise<boolean> {
  try {
    const supabase = createClient(await cookies());
    const { data } = await supabase.auth.getClaims();
    return data?.claims?.is_anonymous === true;
  } catch {
    return false;
  }
}
