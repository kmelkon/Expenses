import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";

/**
 * Server-side page that ensures an authenticated user with a household and renders the dashboard.
 *
 * If no authenticated user is found this page redirects to `/login`. If the user's profile exists but
 * does not include a `household_id` this page redirects to `/setup`.
 *
 * @returns The Dashboard JSX element for the authenticated user and their profile.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if user has a household
  if (!profile?.household_id) {
    redirect("/setup");
  }

  return <Dashboard user={user} profile={profile} />;
}