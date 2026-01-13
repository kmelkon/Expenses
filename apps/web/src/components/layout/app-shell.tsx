"use client";

import { type ReactNode } from "react";
import { Avatar } from "@/components/ui";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  userName?: string;
  userAvatar?: string;
  showHeader?: boolean;
  showTabs?: boolean;
  onAddClick?: () => void;
  headerRight?: ReactNode;
  className?: string;
}

export function AppShell({
  children,
  title = "Expenses",
  userName,
  userAvatar,
  showHeader = true,
  showTabs = true,
  onAddClick,
  headerRight,
  className,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--warm-200)]">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-lg font-bold text-[var(--warm-900)]">
              {title}
            </h1>
            <div className="flex items-center gap-3">
              {headerRight}
              {userName && (
                <Avatar
                  name={userName}
                  src={userAvatar}
                  size="sm"
                />
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "max-w-4xl mx-auto px-4 py-6",
          showTabs && "pb-24", // Add padding for bottom tab bar
          className
        )}
      >
        {children}
      </main>

      {/* Bottom Tab Bar */}
      {showTabs && <BottomTabBar onAddClick={onAddClick} />}
    </div>
  );
}
