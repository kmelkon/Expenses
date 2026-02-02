"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PayerRow, ProfileRow } from "@expenses/shared";
import { Input, Label, Card, Button } from "@/components/ui";

export default function PayersPage() {
  const [payers, setPayers] = useState<PayerRow[]>([]);
  const [newPayerId, setNewPayerId] = useState("");
  const [newPayerName, setNewPayerName] = useState("");
  const [editingPayer, setEditingPayer] = useState<PayerRow | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const loadData = useCallback(async () => {
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

    const { data: payersData } = await supabase
      .from("payers")
      .select("*")
      .eq("household_id", profileData.household_id)
      .order("created_at");

    setPayers(payersData || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddPayer(e: React.FormEvent) {
    e.preventDefault();
    const trimmedId = newPayerId.trim().toLowerCase();
    const trimmedName = newPayerName.trim();

    if (!trimmedId || !trimmedName || !profile?.household_id) return;

    if (!/^[a-z_]+$/.test(trimmedId)) {
      alert("Payer ID must contain only lowercase letters and underscores");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("payers").insert({
      id: trimmedId,
      household_id: profile.household_id,
      display_name: trimmedName,
    });

    if (error) {
      alert("Failed to add payer. ID may already exist.");
    } else {
      setNewPayerId("");
      setNewPayerName("");
      await loadData();
    }

    setSaving(false);
  }

  async function handleUpdatePayer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPayer || !editingName.trim()) return;

    setSaving(true);

    const { error } = await supabase
      .from("payers")
      .update({ display_name: editingName.trim() })
      .eq("id", editingPayer.id)
      .eq("household_id", profile?.household_id);

    if (error) {
      alert("Failed to update payer.");
    } else {
      setEditingPayer(null);
      setEditingName("");
      await loadData();
    }

    setSaving(false);
  }

  async function handleDeletePayer(payer: PayerRow) {
    if (
      !confirm(
        `Delete "${payer.display_name}"? Existing expenses will keep this payer's ID.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("payers")
      .delete()
      .eq("id", payer.id)
      .eq("household_id", profile?.household_id);

    if (error) {
      alert("Failed to delete payer.");
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
          <h1 className="text-xl font-bold text-charcoal-text">Payers</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Add Payer Form */}
        <Card variant="blue">
          <h2 className="text-lg font-bold text-charcoal-text mb-4">
            Add Payer
          </h2>
          <form onSubmit={handleAddPayer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payerId">ID</Label>
                <Input
                  id="payerId"
                  type="text"
                  value={newPayerId}
                  onChange={(e) => setNewPayerId(e.target.value)}
                  placeholder="e.g., john"
                  autoCapitalize="none"
                />
                <p className="text-xs text-light-grey-text mt-1">
                  Lowercase letters and underscores only
                </p>
              </div>
              <div>
                <Label htmlFor="payerName">Display name</Label>
                <Input
                  id="payerName"
                  type="text"
                  value={newPayerName}
                  onChange={(e) => setNewPayerName(e.target.value)}
                  placeholder="e.g., John"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving || !newPayerId.trim() || !newPayerName.trim()}
              variant="primary"
              className="w-full"
            >
              {saving ? "Adding..." : "Add Payer"}
            </Button>
          </form>
        </Card>

        {/* Payers List */}
        <Card variant="lavender" className="p-0 overflow-hidden">
          <h2 className="text-lg font-bold text-charcoal-text px-6 py-4 border-b border-white/30">
            All Payers ({payers.length})
          </h2>
          {payers.length === 0 ? (
            <p className="px-6 py-8 text-center text-light-grey-text">
              No payers yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-white/30">
              {payers.map((payer) => (
                <li
                  key={payer.id}
                  className="px-6 py-4 hover:bg-white/40 transition-colors"
                >
                  {editingPayer?.id === payer.id ? (
                    <form
                      onSubmit={handleUpdatePayer}
                      className="flex items-center gap-3"
                    >
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        disabled={saving}
                        variant="primary"
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingPayer(null);
                          setEditingName("");
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pastel-peach/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-charcoal-text">
                            person
                          </span>
                        </div>
                        <div>
                          <span className="text-charcoal-text font-semibold">
                            {payer.display_name}
                          </span>
                          <span className="text-light-grey-text text-sm ml-2">
                            ({payer.id})
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPayer(payer);
                            setEditingName(payer.display_name);
                          }}
                          className="p-2 text-light-grey-text hover:text-charcoal-text hover:bg-white rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeletePayer(payer)}
                          className="p-2 text-light-grey-text hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
