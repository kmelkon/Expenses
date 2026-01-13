"use client";

import type { ReactNode } from "react";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  userName?: string;
  userAvatar?: string;
  rightContent?: ReactNode;
  className?: string;
}

export function Header({
  title = "Expenses",
  userName,
  userAvatar,
  rightContent,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--warm-200)]",
        className
      )}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--warm-900)]">{title}</h1>
        <div className="flex items-center gap-3">
          {rightContent}
          {userName && (
            <Avatar name={userName} src={userAvatar} size="sm" />
          )}
        </div>
      </div>
    </header>
  );
}
