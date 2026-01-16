"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoryRow, ProfileRow } from "@expenses/shared";
import { Input, Card, Button } from "@/components/ui";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const maxOrder = Math.max(0, ...categories.map((c) => c.display_order));

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
    if (
      !confirm(
        `Delete "${category.name}"? This won't delete existing expenses with this category.`
      )
    ) {
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
      <div className="min-h-screen bg-cream-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-text" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text">
      <header className="bg-white/50 border-b border-white/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-white rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-charcoal-text">
              arrow_back
            </span>
          </Link>
          <h1 className="text-xl font-bold text-charcoal-text">Categories</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Add Category Form */}
        <Card variant="peach">
          <h2 className="text-lg font-bold text-charcoal-text mb-4">
            Add Category
          </h2>
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <Input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={saving || !newCategoryName.trim()}
              variant="primary"
            >
              {saving ? "Adding..." : "Add"}
            </Button>
          </form>
        </Card>

        {/* Categories List */}
        <Card variant="lavender" className="p-0 overflow-hidden">
          <h2 className="text-lg font-bold text-charcoal-text px-6 py-4 border-b border-white/30">
            All Categories ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <p className="px-6 py-8 text-center text-light-grey-text">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-white/30">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pastel-mint/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-charcoal-text text-sm">
                        label
                      </span>
                    </div>
                    <span className="text-charcoal-text font-medium">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 text-light-grey-text hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
