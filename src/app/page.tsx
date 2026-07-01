import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LandingPageClient from "./landing-client";

export default async function RootPage() {
  const supabase = await createClient();
  // getSession reads the cookie that client-side signOut() clears.
  // getUser() makes a network call and can return a user even after
  // client-side signOut if the HTTP-only cookie is still present.
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}
