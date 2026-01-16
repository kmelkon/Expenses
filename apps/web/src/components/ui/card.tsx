import { forwardRef, type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "mint" | "blue" | "peach" | "lavender";
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className = "", variant = "default", hover = false, children, ...props },
    ref
  ) => {
    const baseStyles = "rounded-3xl p-8 relative overflow-hidden";

    const variants = {
      default: "bg-white",
      mint: "bg-pastel-mint/40",
      blue: "bg-pastel-blue/40",
      peach: "bg-pastel-peach/40",
      lavender: "bg-pastel-lavender/30",
    };

    const hoverStyles = hover
      ? "transition-transform duration-500 hover:scale-[1.01]"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
