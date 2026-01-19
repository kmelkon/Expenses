import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui";

export default async function ReportsPage() {
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

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text">
      <AppHeader user={user} profile={profile} activeTab="reports" />

      <main className="w-full max-w-3xl mx-auto px-6 pb-20 mt-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-charcoal-text mb-2">
            Reports
          </h1>
          <p className="text-lg text-light-grey-text font-light">
            Insights and analytics for your household.
          </p>
        </div>

        <Card variant="lavender" className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-charcoal-text/30 mb-4">
            analytics
          </span>
          <h2 className="text-2xl font-bold text-charcoal-text mb-2">
            Coming Soon
          </h2>
          <p className="text-light-grey-text max-w-sm mx-auto">
            We&apos;re working on powerful analytics to help you understand your
            spending patterns better.
          </p>
        </Card>
      </main>
    </div>
  );
}
