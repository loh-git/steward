"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FINANCIAL_INPUT_COOKIE } from "@/utils/supabase/financial-profile";

// captchaToken is the Turnstile token from the browser. Supabase requires it on every one of these
// calls once CAPTCHA is enabled in the dashboard, and ignores it while it's off.
export async function signIn(
  email: string,
  password: string,
  captchaToken?: string,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) throw new Error(error.message);

  // The cookie holds whoever last saved /setup on this browser (possibly a demo persona); drop it
  // so it can't be used as this account's profile.
  cookieStore.delete(FINANCIAL_INPUT_COOKIE);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  email: string,
  password: string,
  captchaToken?: string,
) {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { captchaToken },
  });

  if (error) throw new Error(error.message);

  // The root layout works out "is this a demo session?" on the server and isn't re-rendered on a
  // client-side navigation by itself. Without this, someone who signs up while holding a leftover
  // demo session keeps seeing the demo banner on their new real account.
  revalidatePath("/", "layout");
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();

  cookieStore.delete(FINANCIAL_INPUT_COOKIE);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(email: string, captchaToken?: string) {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    captchaToken,
  });

  if (error) throw new Error(error.message);
}
