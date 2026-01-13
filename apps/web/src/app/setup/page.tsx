"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, ArrowLeft, AlertCircle } from "@/components/ui/icons";

export default function SetupPage() {
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("create_household", {
      p_name: householdName,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Failed to create household. Please try again.");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("join_household", {
      p_join_code: joinCode.toLowerCase(),
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Failed to join household. Please try again.");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--terracotta-50)] via-[var(--warm-50)] to-[var(--sage-50)] px-4">
      <div className="max-w-md w-full">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--warm-900)]">
              Welcome!
            </h1>
            <p className="mt-2 text-[var(--warm-600)]">
              Set up your household to start tracking expenses
            </p>
          </div>

          {/* Mode Selection */}
          {!mode && (
            <div className="space-y-4">
              <button
                onClick={() => setMode("create")}
                className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-[var(--warm-200)] hover:border-[var(--terracotta-300)] hover:bg-[var(--terracotta-50)] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--terracotta-100)] flex items-center justify-center group-hover:bg-[var(--terracotta-200)] transition-colors">
                    <Plus className="w-6 h-6 text-[var(--terracotta-600)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--warm-900)]">
                      Create a new household
                    </p>
                    <p className="text-sm text-[var(--warm-500)]">
                      Start fresh and invite your partner
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-[var(--warm-200)] hover:border-[var(--sage-300)] hover:bg-[var(--sage-50)] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--sage-100)] flex items-center justify-center group-hover:bg-[var(--sage-200)] transition-colors">
                    <Users className="w-6 h-6 text-[var(--sage-600)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--warm-900)]">
                      Join an existing household
                    </p>
                    <p className="text-sm text-[var(--warm-500)]">
                      Enter a code from your partner
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Create Form */}
          {mode === "create" && (
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="householdName">Household name</Label>
                <Input
                  id="householdName"
                  type="text"
                  value={householdName}
                  onChange={e => setHouseholdName(e.target.value)}
                  placeholder="e.g., Smith Family"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode(null);
                    setError("");
                  }}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          )}

          {/* Join Form */}
          {mode === "join" && (
            <form onSubmit={handleJoin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Join code</Label>
                <Input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  placeholder="Enter the code from your partner"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode(null);
                    setError("");
                  }}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Joining..." : "Join"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
