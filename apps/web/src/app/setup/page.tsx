"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { OurNestLogo } from "@/components/ournest-logo";

type SetupView = "select" | "create" | "join";

export default function SetupPage() {
  const [view, setView] = useState<SetupView>("select");
  const [householdName, setHouseholdName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        const firstName = user.user_metadata.full_name.split(" ")[0];
        setUserName(firstName);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    };
    getUser();
  }, [supabase.auth]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleBack = () => {
    setView("select");
    setError("");
    setHouseholdName("");
    setJoinCode("");
  };

  return (
    <div className="bg-cream-bg min-h-screen text-charcoal-text selection:bg-pastel-peach flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-cream-bg/90 backdrop-blur-sm flex items-center justify-between max-w-5xl mx-auto w-full">
        <OurNestLogo size="sm" />
        <div className="h-10 w-10 rounded-full bg-white border border-pastel-blue/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-charcoal-text/60">
            person
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-6 pb-20 mt-8 flex-grow flex flex-col justify-center items-center">
        {view === "select" && (
          <SelectionView
            userName={userName}
            onCreateClick={() => setView("create")}
            onJoinClick={() => setView("join")}
            onSignOut={handleSignOut}
          />
        )}

        {view === "create" && (
          <CreateView
            householdName={householdName}
            setHouseholdName={setHouseholdName}
            loading={loading}
            error={error}
            onSubmit={handleCreate}
            onBack={handleBack}
          />
        )}

        {view === "join" && (
          <JoinView
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            loading={loading}
            error={error}
            onSubmit={handleJoin}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 opacity-50 mt-auto">
        <p className="text-xs font-medium text-charcoal-text">OurNest</p>
      </footer>
    </div>
  );
}

// Selection View Component
function SelectionView({
  userName,
  onCreateClick,
  onJoinClick,
  onSignOut,
}: {
  userName: string;
  onCreateClick: () => void;
  onJoinClick: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal-text mb-4 tracking-tight">
          Welcome{userName ? `, ${userName}` : ""}.
        </h1>
        <p className="text-lg md:text-xl text-light-grey-text font-light max-w-lg mx-auto">
          Let&apos;s get you settled. Create a new shared space or join an
          existing one to start tracking.
        </p>
      </div>

      {/* Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Start a Home Card */}
        <button
          onClick={onCreateClick}
          className="group relative bg-white rounded-3xl p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:shadow-pastel-mint/20 hover:-translate-y-1 border border-transparent hover:border-pastel-mint/50 overflow-hidden h-[420px] cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pastel-mint/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            <div className="absolute w-40 h-40 bg-pastel-mint/30 rounded-full group-hover:scale-110 transition-transform duration-700 ease-out" />
            <div className="absolute w-32 h-32 bg-pastel-mint/50 rounded-full group-hover:scale-95 transition-transform duration-700 ease-out delay-75 blur-sm" />
            <div className="absolute w-full h-full animate-[spin_10s_linear_infinite] opacity-30">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent-success rounded-full" />
              <div className="absolute bottom-4 right-8 w-2 h-2 bg-pastel-blue rounded-full" />
            </div>
            <span className="material-symbols-outlined icon-xl text-charcoal-text/80 relative z-10 group-hover:text-charcoal-text transition-colors duration-300">
              potted_plant
            </span>
          </div>
          <div className="relative z-10 mt-auto">
            <h2 className="text-2xl font-bold text-charcoal-text mb-3">
              Start a Home
            </h2>
            <p className="text-light-grey-text leading-relaxed group-hover:text-charcoal-text/70 transition-colors">
              Create a fresh dashboard for your household. Invite your partner
              and begin your journey.
            </p>
            <div className="mt-8 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex justify-center">
              <span className="w-10 h-10 rounded-full bg-charcoal-text text-cream-bg flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </div>
          </div>
        </button>

        {/* Join a Home Card */}
        <button
          onClick={onJoinClick}
          className="group relative bg-white rounded-3xl p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:shadow-pastel-blue/20 hover:-translate-y-1 border border-transparent hover:border-pastel-blue/50 overflow-hidden h-[420px] cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pastel-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            <div className="absolute w-40 h-40 bg-pastel-blue/30 rounded-full group-hover:scale-110 transition-transform duration-700 ease-out" />
            <div className="absolute w-32 h-32 bg-pastel-blue/50 rounded-full group-hover:scale-95 transition-transform duration-700 ease-out delay-75 blur-sm" />
            <div className="absolute w-full h-full animate-[spin_12s_linear_infinite_reverse] opacity-30">
              <div className="absolute top-4 right-4 w-3 h-3 bg-accent-primary rounded-full" />
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-pastel-lavender rounded-full" />
            </div>
            <span className="material-symbols-outlined icon-xl text-charcoal-text/80 relative z-10 group-hover:text-charcoal-text transition-colors duration-300">
              key
            </span>
          </div>
          <div className="relative z-10 mt-auto">
            <h2 className="text-2xl font-bold text-charcoal-text mb-3">
              Join a Home
            </h2>
            <p className="text-light-grey-text leading-relaxed group-hover:text-charcoal-text/70 transition-colors">
              Have an invite code? Enter it to instantly sync with an existing
              household space.
            </p>
            <div className="mt-8 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex justify-center">
              <span className="w-10 h-10 rounded-full bg-charcoal-text text-cream-bg flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={onSignOut}
        className="mt-16 text-sm font-bold text-light-grey-text hover:text-charcoal-text transition-colors"
      >
        Log out of account
      </button>
    </div>
  );
}

// Create View Component
function CreateView({
  householdName,
  setHouseholdName,
  loading,
  error,
  onSubmit,
  onBack,
}: {
  householdName: string;
  setHouseholdName: (value: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <div className="w-full max-w-[480px]">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_-10px_rgba(74,69,67,0.08)] border border-white/60 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pastel-mint/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pastel-peach/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div className="mb-6 bg-cream-bg p-4 rounded-2xl shadow-sm text-charcoal-text/80">
            <span className="material-symbols-outlined text-4xl">
              potted_plant
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-charcoal-text mb-2 tracking-tight text-center">
            Name your household
          </h1>
          <p className="text-light-grey-text text-center mb-10 font-medium">
            Give your new shared space a name.
          </p>

          {/* Form */}
          <form className="w-full space-y-8" onSubmit={onSubmit}>
            <div className="relative group">
              <label className="sr-only" htmlFor="household-name">
                Household Name
              </label>
              <input
                autoComplete="off"
                className="w-full bg-cream-bg border-none rounded-2xl py-5 px-6 text-lg text-charcoal-text placeholder-light-grey-text/60 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-pastel-mint/50 focus:bg-white transition-all duration-300"
                id="household-name"
                placeholder="e.g. The Smith's Home"
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                required
              />
              <div className="absolute -bottom-4 left-4 right-4 h-4 bg-pastel-mint/10 blur-md rounded-[50%] -z-10 group-focus-within:bg-pastel-mint/30 transition-colors duration-300" />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              className="w-full bg-pastel-mint hover:bg-[#ccebc5] text-charcoal-text font-bold text-lg py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pastel-mint/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Creating..." : "Create Home"}</span>
              {!loading && (
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Back link */}
          <button
            onClick={onBack}
            className="mt-8 flex items-center gap-1.5 text-sm font-bold text-light-grey-text hover:text-charcoal-text transition-colors group px-4 py-2 rounded-lg hover:bg-cream-bg"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">
              arrow_back
            </span>
            Back to options
          </button>
        </div>
      </div>
    </div>
  );
}

// Join View Component
function JoinView({
  joinCode,
  setJoinCode,
  loading,
  error,
  onSubmit,
  onBack,
}: {
  joinCode: string;
  setJoinCode: (value: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <div className="w-full max-w-md relative">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden text-center">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pastel-blue/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pastel-mint/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div className="h-20 w-20 bg-pastel-blue/20 text-accent-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-4 ring-white">
            <span className="material-symbols-outlined icon-lg">key</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-charcoal-text mb-3 tracking-tight">
            Enter invite code
          </h1>
          <p className="text-light-grey-text mb-10 leading-relaxed max-w-xs mx-auto">
            Check your partner&apos;s dashboard for the 6-digit invite code to
            sync your spaces.
          </p>

          {/* Form */}
          <form className="w-full" onSubmit={onSubmit}>
            <div className="relative w-full mb-8 group">
              <label className="sr-only" htmlFor="join-code">
                Join Code
              </label>
              <input
                className="w-full bg-cream-bg border-2 border-pastel-blue/30 text-charcoal-text text-center text-4xl font-bold tracking-[0.6em] rounded-2xl py-6 focus:border-accent-primary focus:ring-4 focus:ring-pastel-blue/20 transition-all outline-none placeholder:text-gray-200 placeholder:tracking-[0.6em]"
                maxLength={6}
                placeholder="------"
                type="text"
                id="join-code"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            <button
              className="w-full bg-accent-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-pastel-blue/40 hover:shadow-xl hover:shadow-pastel-blue/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Joining..." : "Join Home"}</span>
            </button>
          </form>

          {/* Back link */}
          <button
            onClick={onBack}
            className="mt-8 text-sm font-bold text-light-grey-text hover:text-charcoal-text transition-colors flex items-center gap-2 opacity-80 hover:opacity-100 group"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
