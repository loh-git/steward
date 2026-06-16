import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadFinancialProfile } from "@/lib/supabase/financial-profile";
import { createClient } from "@/utils/supabase/server";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const initialData = await loadFinancialProfile();

  return <SetupForm initialData={initialData} userId={user.id} />;
}
