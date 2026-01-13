"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PayerRow, ProfileRow } from "@expenses/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { ChevronRight, Loader2, Trash2, Plus, Edit, Check, X } from "@/components/ui/icons";

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

    const { data: payersData } = await supabase
      .from("payers")
      .select("*")
      .eq("household_id", profileData.household_id)
      .order("created_at");

    setPayers(payersData || []);
    setLoading(false);
  }

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
    if (!confirm(`Delete "${payer.display_name}"? Existing expenses will keep this payer's ID.`)) {
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
          <h1 className="text-lg font-bold text-[var(--warm-900)]">Payers</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Payer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Payer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPayer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payerId">ID</Label>
                  <Input
                    id="payerId"
                    type="text"
                    value={newPayerId}
                    onChange={e => setNewPayerId(e.target.value)}
                    placeholder="e.g., john"
                    autoCapitalize="none"
                  />
                  <p className="text-xs text-[var(--warm-500)]">
                    Lowercase letters and underscores only
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payerName">Display name</Label>
                  <Input
                    id="payerName"
                    type="text"
                    value={newPayerName}
                    onChange={e => setNewPayerName(e.target.value)}
                    placeholder="e.g., John"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={saving || !newPayerId.trim() || !newPayerName.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Adding..." : "Add Payer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Payers ({payers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payers.length === 0 ? (
              <p className="px-6 py-8 text-center text-[var(--warm-500)]">
                No payers yet. Add one above.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--warm-100)]">
                {payers.map(payer => (
                  <li
                    key={payer.id}
                    className="px-6 py-4 hover:bg-[var(--warm-50)] transition-colors"
                  >
                    {editingPayer?.id === payer.id ? (
                      <form
                        onSubmit={handleUpdatePayer}
                        className="flex items-center gap-3"
                      >
                        <Avatar name={editingName || payer.display_name} size="md" />
                        <Input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={saving}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPayer(null);
                            setEditingName("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar name={payer.display_name} size="md" />
                          <div>
                            <span className="text-[var(--warm-900)] font-medium">
                              {payer.display_name}
                            </span>
                            <p className="text-xs text-[var(--warm-500)]">
                              ID: {payer.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPayer(payer);
                              setEditingName(payer.display_name);
                            }}
                            className="text-[var(--warm-400)] hover:text-[var(--terracotta-600)]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayer(payer)}
                            className="text-[var(--warm-400)] hover:text-[var(--color-error)] hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
