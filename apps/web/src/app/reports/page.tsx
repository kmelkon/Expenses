import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportsPage } from "@/components/reports-page";

export default async function ReportsPageRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  if (!profile?.household_id) {
    redirect("/setup");
  }

  return <ReportsPage user={user} profile={profile} />;
}
