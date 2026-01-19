"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoryRow, ProfileRow } from "@expenses/shared";

// Available icons for category picker
const CATEGORY_ICONS = [
  // Row 1: Common spending
  "shopping_basket",
  "restaurant",
  "directions_car",
  "cottage",
  "movie",
  // Row 2: Services & activities
  "medical_services",
  "shopping_bag",
  "fitness_center",
  "hiking",
  "eco",
  // Row 3: Utilities & finance
  "bolt",
  "wifi",
  "phone_android",
  "credit_card",
  "savings",
] as const;

// Available colors with their Tailwind class mappings
const CATEGORY_COLORS = [
  { id: "mint", bg: "bg-pastel-mint", ring: "ring-pastel-mint" },
  { id: "blue", bg: "bg-pastel-blue", ring: "ring-pastel-blue" },
  { id: "peach", bg: "bg-pastel-peach", ring: "ring-pastel-peach" },
  { id: "lavender", bg: "bg-pastel-lavender", ring: "ring-pastel-lavender" },
  { id: "yellow", bg: "bg-accent-warning/50", ring: "ring-accent-warning" },
  { id: "grey", bg: "bg-gray-200", ring: "ring-gray-300" },
] as const;

type CategoryColor = (typeof CATEGORY_COLORS)[number]["id"];
type CategoryIcon = (typeof CATEGORY_ICONS)[number];

function getColorClasses(colorId: string | undefined) {
  return (
    CATEGORY_COLORS.find((c) => c.id === colorId) || CATEGORY_COLORS[0]
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<CategoryIcon>("shopping_basket");
  const [selectedColor, setSelectedColor] = useState<CategoryColor>("mint");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      icon: selectedIcon,
      color: selectedColor,
    });

    if (error) {
      alert("Failed to add category. It may already exist.");
    } else {
      setNewCategoryName("");
      setSelectedIcon("shopping_basket");
      setSelectedColor("mint");
      setShowPicker(false);
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

  const colorClasses = getColorClasses(selectedColor);

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text">
      <main className="max-w-xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-charcoal-text mb-2">
            Manage Categories
          </h1>
          <p className="text-light-grey-text">
            Customize your household spending types.
          </p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="mb-10">
          <div className="relative" ref={pickerRef}>
            <div className="flex items-center gap-3 bg-white rounded-full p-2 pr-3 shadow-sm border border-gray-100">
              {/* Icon Button */}
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className={`w-12 h-12 rounded-full ${colorClasses.bg} flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${showPicker ? "ring-2 ring-offset-2 " + colorClasses.ring : ""}`}
              >
                <span className="material-symbols-outlined text-charcoal-text/70">
                  {selectedIcon}
                </span>
              </button>

              {/* Name Input */}
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name..."
                className="flex-1 bg-transparent border-none text-charcoal-text placeholder-light-grey-text/60 focus:ring-0 text-lg"
              />

              {/* Add Button */}
              <button
                type="submit"
                disabled={saving || !newCategoryName.trim()}
                className="bg-charcoal-text text-cream-bg px-6 py-2.5 rounded-full font-bold text-sm hover:bg-charcoal-text/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "..." : "Add"}
              </button>
            </div>

            {/* Icon/Color Picker Dropdown */}
            {showPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 w-72">
                {/* Icon Selection */}
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-light-grey-text mb-3">
                    Select Icon
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {CATEGORY_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          selectedIcon === icon
                            ? `${colorClasses.bg} ring-2 ring-offset-2 ${colorClasses.ring}`
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${
                            selectedIcon === icon
                              ? "text-charcoal-text"
                              : "text-charcoal-text/50"
                          }`}
                        >
                          {icon}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-light-grey-text mb-3">
                    Select Color
                  </p>
                  <div className="flex gap-2">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-9 h-9 rounded-full ${color.bg} transition-all hover:scale-110 cursor-pointer ${
                          selectedColor === color.id
                            ? "ring-2 ring-offset-2 " + color.ring
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-center text-light-grey-text py-12">
              No categories yet. Add one above.
            </p>
          ) : (
            categories.map((category) => {
              const catColor = getColorClasses(category.color);
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${catColor.bg} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined text-charcoal-text/70">
                        {category.icon || "label"}
                      </span>
                    </div>
                    <span className="text-charcoal-text font-semibold text-lg">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="text-light-grey-text/60 hover:text-red-400 font-semibold text-sm uppercase tracking-wide transition-colors px-3 py-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-light-grey-text hover:text-charcoal-text transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
