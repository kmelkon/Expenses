import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ChevronRight, Users, Wallet } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const household = profile.households as { name: string; join_code: string } | null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--warm-200)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 -ml-2 text-[var(--warm-500)] hover:text-[var(--warm-700)] hover:bg-[var(--warm-100)] rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Link>
            <h1 className="text-lg font-bold text-[var(--warm-900)]">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar name={profile.display_name} size="xl" />
              <div>
                <h2 className="text-xl font-semibold text-[var(--warm-900)]">
                  {profile.display_name}
                </h2>
                <p className="text-sm text-[var(--warm-500)]">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Household Info */}
        <Card>
          <CardHeader>
            <CardTitle>Household</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--warm-600)]">Name</span>
              <span className="text-[var(--warm-900)] font-medium">
                {household?.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--warm-600)]">Join code</span>
              <code className="bg-[var(--warm-100)] px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-mono text-[var(--warm-800)]">
                {household?.join_code}
              </code>
            </div>
            <p className="text-sm text-[var(--warm-500)] pt-2 border-t border-[var(--warm-100)]">
              Share this code with others to let them join your household.
            </p>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card className="overflow-hidden">
          <Link
            href="/settings/categories"
            className="flex items-center justify-between px-6 py-4 hover:bg-[var(--warm-50)] transition-colors border-b border-[var(--warm-100)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--sage-100)] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[var(--sage-600)]" />
              </div>
              <div>
                <span className="text-[var(--warm-900)] font-medium">
                  Categories
                </span>
                <p className="text-sm text-[var(--warm-500)]">
                  Manage expense categories
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--warm-400)]" />
          </Link>

          <Link
            href="/settings/payers"
            className="flex items-center justify-between px-6 py-4 hover:bg-[var(--warm-50)] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--terracotta-100)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--terracotta-600)]" />
              </div>
              <div>
                <span className="text-[var(--warm-900)] font-medium">Payers</span>
                <p className="text-sm text-[var(--warm-500)]">
                  Manage household members
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--warm-400)]" />
          </Link>
        </Card>
      </main>
    </div>
  );
}
