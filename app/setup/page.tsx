import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadFinancialProfile } from "@/utils/supabase/financial-profile";
import { createClient } from "@/utils/supabase/server";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user isn't logged in, redirect them to the login page.
  // This is a server-side redirect, so the user will never see this page if they are not logged in.
  if (!user) {
    redirect("/auth/login");
  }

  // Load their initial financial profile data from Supabase
  const initialData = await loadFinancialProfile();

  // Render SetupForm with their initialData and userId. On first time setup, their initialData
  // will be empty, but on subsequent visits, it will be pre-filled with their existing data.
  return <SetupForm initialData={initialData} userId={user.id} />;
}
