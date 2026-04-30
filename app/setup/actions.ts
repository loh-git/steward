"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/types/user";
import { createClient } from "@/utils/supabase/server";

export async function createUser(
  firstName: string,
  lastName: string,
  age: number,
) {
  const user: User = {
    id: Date.now(),
    firstName,
    lastName,
    age,
  };

  // (await cookies()).set("user", JSON.stringify(user), {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   path: "/",
  //   maxAge: 60 * 60 * 24 * 30,
  // });
  const supabase = createClient(await cookies());
  const res = await supabase.from("users").insert(user);
  if (res.error) {
    console.error("Error inserting user:", res.error);
    throw new Error("Failed to create user");
  } else {
    console.log("User created successfully:", res.data);
  }

  redirect("/dashboard");
}
