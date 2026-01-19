import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExpenseListPage } from "@/components/expense-list-page";

export default async function ExpensesPage() {
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

  return <ExpenseListPage user={user} profile={profile} />;
}
