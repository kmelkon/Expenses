"use client";

import { forwardRef, type HTMLAttributes, useMemo } from "react";
import { cn } from "@/lib/utils";

const GRADIENT_PAIRS = [
  ["#d96b4a", "#e89075"], // Terracotta
  ["#7c8a62", "#99a481"], // Sage
  ["#c5523b", "#f2b8a8"], // Deep terracotta
  ["#616e4d", "#b8c0a5"], // Deep sage
  ["#a5422f", "#f8d5cc"], // Dark terracotta
] as const;

function getGradientForName(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [start, end] = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, size = "md", className, ...props }, ref) => {
    const gradient = useMemo(() => getGradientForName(name), [name]);
    const initials = useMemo(() => getInitials(name), [name]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-semibold text-white overflow-hidden flex-shrink-0",
          sizeClasses[size],
          className
        )}
        style={{ background: gradient }}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
