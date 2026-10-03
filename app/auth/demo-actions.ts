"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FINANCIAL_INPUT_COOKIE } from "@/utils/supabase/financial-profile";
import { isDemoSeeded, seedDemoUser } from "@/utils/demo/seed-user";
import { DEMO_LANDING_PATH, type DemoActionState } from "@/types/demo";

// Called by DemoButton right after the browser has signed the visitor in anonymously.
// Server Actions are reachable by any signed-in user via a direct POST, so the
// is_anonymous check below is what stops a real account from ever being seeded.
export async function seedDemo(): Promise<DemoActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Couldn't start the demo. Please try again." };

  // A real account: never seed, just send them in with their data untouched.
  if (!user.is_anonymous) redirect(DEMO_LANDING_PATH);

  try {
    if (!(await isDemoSeeded(supabase, user.id))) {
      await seedDemoUser(supabase, user.id, new Date());
    }
  } catch (err) {
    console.error(err);
    return { error: "We couldn't prepare the demo. Please try again." };
  }

  // A stale cookie from an earlier /setup save would otherwise be used as the persona's profile.
  cookieStore.delete(FINANCIAL_INPUT_COOKIE);
  revalidatePath("/", "layout");
  // redirect() throws, so it stays outside the try/catch above.
  redirect(DEMO_LANDING_PATH);
}
