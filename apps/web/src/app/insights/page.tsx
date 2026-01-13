import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InsightsContent } from "./insights-content";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) {
    redirect("/setup");
  }

  // Fetch categories and payers for the add expense modal
  const [{ data: categories }, { data: payers }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("household_id", profile.household_id)
      .order("display_order"),
    supabase
      .from("payers")
      .select("*")
      .eq("household_id", profile.household_id),
  ]);

  return (
    <InsightsContent
      userName={profile.display_name}
      householdId={profile.household_id}
      categories={categories || []}
      payers={payers || []}
    />
  );
}
