"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoryRow, ProfileRow } from "@expenses/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Loader2, Trash2, Plus } from "@/components/ui/icons";

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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[var(--terracotta-500)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--warm-200)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 -ml-2 text-[var(--warm-500)] hover:text-[var(--warm-700)] hover:bg-[var(--warm-100)] rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <h1 className="text-lg font-bold text-[var(--warm-900)]">Categories</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Category Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="flex gap-3">
              <Input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={saving || !newCategoryName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Adding..." : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categories.length === 0 ? (
              <p className="px-6 py-8 text-center text-[var(--warm-500)]">
                No categories yet. Add one above.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--warm-100)]">
                {categories.map(category => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[var(--warm-50)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sage-100)] text-[var(--sage-700)] text-sm font-medium">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-[var(--warm-900)] font-medium">
                        {category.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-[var(--warm-400)] hover:text-[var(--color-error)] hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
