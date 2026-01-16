"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow } from "@expenses/shared";
import { OurNestLogo } from "./ournest-logo";

interface AppHeaderProps {
  user: User;
  profile: ProfileRow;
  activeTab?: "dashboard" | "expenses" | "reports";
}

export function AppHeader({
  user,
  profile,
  activeTab = "dashboard",
}: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", href: "/" },
    { id: "expenses", label: "Expenses", href: "/expenses" },
    { id: "reports", label: "Reports", href: "/reports" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 px-6 py-4 bg-cream-bg/90 backdrop-blur-sm flex items-center justify-between max-w-5xl mx-auto w-full">
      {/* Logo */}
      <OurNestLogo size="md" />

      {/* Navigation - hidden on mobile */}
      <nav className="hidden md:flex items-center gap-1 bg-white/50 p-1.5 rounded-full border border-white/50 shadow-sm">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-4 py-1.5 text-sm font-medium transition-colors rounded-full ${
              activeTab === tab.id
                ? "bg-white text-charcoal-text font-bold shadow-sm"
                : "text-light-grey-text hover:text-charcoal-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* User avatar with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-10 w-10 rounded-full bg-white border border-pastel-blue/20 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
          aria-label="User menu"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-charcoal-text">
              {profile.display_name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-charcoal-text/10 py-2 z-50">
            <div className="px-4 py-2 border-b border-charcoal-text/10">
              <p className="text-sm font-semibold text-charcoal-text truncate">
                {profile.display_name}
              </p>
              <p className="text-xs text-light-grey-text truncate">
                {user.email}
              </p>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-text hover:bg-cream-bg transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">
                settings
              </span>
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-charcoal-text hover:bg-cream-bg transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
