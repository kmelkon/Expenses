"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
          <p className="mt-2 text-gray-600">
            Set up your household to start tracking expenses
          </p>
        </div>

        {!mode && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("create")}
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create a new household
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Join an existing household
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="householdName">Household name</Label>
              <Input
                id="householdName"
                type="text"
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
                placeholder="e.g., Smith Family"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Label htmlFor="joinCode">Join code</Label>
              <Input
                id="joinCode"
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Enter the code from your partner"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
