"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomTabBarProps {
  onAddClick?: () => void;
}

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/insights", icon: PieChart, label: "Insights" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function BottomTabBar({ onAddClick }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--warm-200)] pb-safe">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16 relative">
          {/* Home Tab */}
          <TabLink
            href={tabs[0].href}
            icon={tabs[0].icon}
            label={tabs[0].label}
            isActive={pathname === tabs[0].href}
          />

          {/* Insights Tab */}
          <TabLink
            href={tabs[1].href}
            icon={tabs[1].icon}
            label={tabs[1].label}
            isActive={pathname === tabs[1].href}
          />

          {/* Center Add Button */}
          <div className="relative -mt-6">
            <button
              onClick={onAddClick}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full",
                "bg-[var(--terracotta-500)] text-white shadow-[var(--shadow-lg)]",
                "hover:bg-[var(--terracotta-600)] active:scale-95",
                "transition-all duration-[var(--duration-fast)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
              )}
              aria-label="Add expense"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Settings Tab */}
          <TabLink
            href={tabs[2].href}
            icon={tabs[2].icon}
            label={tabs[2].label}
            isActive={pathname.startsWith("/settings")}
          />

          {/* Placeholder for symmetry */}
          <div className="w-12" />
        </div>
      </div>
    </nav>
  );
}

interface TabLinkProps {
  href: string;
  icon: typeof Home;
  label: string;
  isActive: boolean;
}

function TabLink({ href, icon: Icon, label, isActive }: TabLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center w-12 py-2 gap-0.5",
        "transition-colors duration-[var(--duration-fast)]",
        isActive
          ? "text-[var(--terracotta-600)]"
          : "text-[var(--warm-500)] hover:text-[var(--warm-700)]"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
