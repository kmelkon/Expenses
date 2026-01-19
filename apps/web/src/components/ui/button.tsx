import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-charcoal-text text-cream-bg hover:bg-charcoal-text/80 shadow-lg shadow-charcoal-text/20",
      secondary:
        "bg-white text-charcoal-text border border-charcoal-text/10 hover:border-charcoal-text/30 hover:bg-gray-50 shadow-sm hover:shadow-md",
      ghost:
        "text-charcoal-text/60 hover:text-charcoal-text hover:bg-white/40",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-sm rounded-lg",
      md: "px-6 py-3 text-sm rounded-full",
      lg: "px-8 py-4 text-base rounded-full",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
