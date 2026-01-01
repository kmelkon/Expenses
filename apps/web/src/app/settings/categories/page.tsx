"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoryRow, ProfileRow } from "@expenses/shared";
import { Input } from "@/components/ui";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profileData?.household_id) {
      router.push("/setup");
      return;
    }

    setProfile(profileData);

    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("household_id", profileData.household_id)
      .order("display_order");

    setCategories(categoriesData || []);
    setLoading(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed || !profile?.household_id) return;

    setSaving(true);

    const id = trimmed.toLowerCase().replace(/\s+/g, "_");
    const maxOrder = Math.max(0, ...categories.map(c => c.display_order));

    const { error } = await supabase.from("categories").insert({
      id,
      household_id: profile.household_id,
      name: trimmed,
      display_order: maxOrder + 1,
    });

    if (error) {
      alert("Failed to add category. It may already exist.");
    } else {
      setNewCategoryName("");
      await loadData();
    }

    setSaving(false);
  }

  async function handleDeleteCategory(category: CategoryRow) {
    if (!confirm(`Delete "${category.name}"? This won't delete existing expenses with this category.`)) {
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id)
      .eq("household_id", profile?.household_id);

    if (error) {
      alert("Failed to delete category.");
    } else {
      await loadData();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/settings" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Category</h2>
          <div className="flex gap-3">
            <Input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1"
            />
            <button
              type="submit"
              disabled={saving || !newCategoryName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </form>

        {/* Categories List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-100">
            All Categories ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {categories.map(category => (
                <li key={category.id} className="flex items-center justify-between px-6 py-4">
                  <span className="text-gray-900">{category.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
