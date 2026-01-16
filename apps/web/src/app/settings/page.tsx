import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, households(name, join_code)")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) {
    redirect("/setup");
  }

  const household = profile.households as {
    name: string;
    join_code: string;
  } | null;

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text">
      <header className="bg-white/50 border-b border-white/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-white rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-charcoal-text">
              arrow_back
            </span>
          </Link>
          <h1 className="text-xl font-bold text-charcoal-text">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Household Info */}
        <Card variant="mint">
          <h2 className="text-lg font-bold text-charcoal-text mb-4">
            Household
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-light-grey-text">Name</span>
              <span className="text-charcoal-text font-semibold">
                {household?.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-grey-text">Join code</span>
              <code className="bg-white/60 px-3 py-1 rounded-lg text-sm font-mono text-charcoal-text">
                {household?.join_code}
              </code>
            </div>
            <p className="text-sm text-light-grey-text mt-2">
              Share this code with others to let them join your household.
            </p>
          </div>
        </Card>

        {/* Settings Menu */}
        <Card variant="lavender" className="p-0 overflow-hidden">
          <Link
            href="/settings/categories"
            className="flex items-center justify-between px-6 py-4 hover:bg-white/40 transition-colors border-b border-white/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pastel-peach/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-charcoal-text">
                  category
                </span>
              </div>
              <div>
                <span className="text-charcoal-text font-semibold">
                  Categories
                </span>
                <p className="text-sm text-light-grey-text">
                  Manage expense categories
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-light-grey-text">
              chevron_right
            </span>
          </Link>

          <Link
            href="/settings/payers"
            className="flex items-center justify-between px-6 py-4 hover:bg-white/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pastel-blue/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-charcoal-text">
                  group
                </span>
              </div>
              <div>
                <span className="text-charcoal-text font-semibold">Payers</span>
                <p className="text-sm text-light-grey-text">
                  Manage household members
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-light-grey-text">
              chevron_right
            </span>
          </Link>
        </Card>

        {/* Account */}
        <Card variant="peach">
          <h2 className="text-lg font-bold text-charcoal-text mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-light-grey-text">Email</span>
              <span className="text-charcoal-text">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-grey-text">Display name</span>
              <span className="text-charcoal-text">{profile.display_name}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
