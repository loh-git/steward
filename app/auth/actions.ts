"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signIn(email: string, password: string) {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(email: string, password: string) {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);
}

export async function signOut() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(email: string) {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) throw new Error(error.message);
}
