"use client";

import Link from "next/link";

type TabId = "dashboard" | "expenses" | "reports";

interface BottomNavProps {
  activeTab: TabId;
}

const tabs: { id: TabId; label: string; icon: string; href: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/" },
  { id: "expenses", label: "Expenses", icon: "receipt_long", href: "/expenses" },
  { id: "reports", label: "Reports", icon: "analytics", href: "/reports" },
];

export function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal-text/5 md:hidden z-50">
      <div className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? "text-charcoal-text"
                  : "text-charcoal-text/40 hover:text-charcoal-text/60"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] font-bold ${isActive ? "" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
