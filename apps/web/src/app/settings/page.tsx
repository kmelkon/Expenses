import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Household Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Household</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              <span className="text-gray-900 font-medium">{household?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Join code</span>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{household?.join_code}</code>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this code with others to let them join your household.
            </p>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Link
            href="/settings/categories"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div>
              <span className="text-gray-900 font-medium">Categories</span>
              <p className="text-sm text-gray-500">Manage expense categories</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/settings/payers"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <span className="text-gray-900 font-medium">Payers</span>
              <p className="text-sm text-gray-500">Manage household members</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Account */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Display name</span>
              <span className="text-gray-900">{profile.display_name}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
