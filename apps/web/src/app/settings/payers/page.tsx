"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PayerRow, ProfileRow } from "@expenses/shared";
import { Input, Label } from "@/components/ui";

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
          <h1 className="text-xl font-bold text-gray-900">Payers</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Payer Form */}
        <form onSubmit={handleAddPayer} className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Payer</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payerId">ID</Label>
                <Input
                  id="payerId"
                  type="text"
                  value={newPayerId}
                  onChange={e => setNewPayerId(e.target.value)}
                  placeholder="e.g., john"
                  autoCapitalize="none"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase letters and underscores only</p>
              </div>
              <div>
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
            <button
              type="submit"
              disabled={saving || !newPayerId.trim() || !newPayerName.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Payer"}
            </button>
          </div>
        </form>

        {/* Payers List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-100">
            All Payers ({payers.length})
          </h2>
          {payers.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">
              No payers yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {payers.map(payer => (
                <li key={payer.id} className="px-6 py-4">
                  {editingPayer?.id === payer.id ? (
                    <form onSubmit={handleUpdatePayer} className="flex items-center gap-3">
                      <Input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPayer(null);
                          setEditingName("");
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-900 font-medium">{payer.display_name}</span>
                        <span className="text-gray-500 text-sm ml-2">({payer.id})</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPayer(payer);
                            setEditingName(payer.display_name);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePayer(payer)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
