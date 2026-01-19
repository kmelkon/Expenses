import { forwardRef, type HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lavender" | "warning" | "mint" | "blue" | "category";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-sm";

    const variants = {
      default: "bg-white/50 text-charcoal-text/50",
      lavender: "bg-pastel-lavender/50 text-charcoal-text/50",
      warning: "bg-accent-warning/30 text-charcoal-text/50",
      mint: "bg-pastel-mint/50 text-charcoal-text/50",
      blue: "bg-pastel-blue/50 text-charcoal-text/50",
      category: "text-light-grey-text text-xs font-semibold",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
