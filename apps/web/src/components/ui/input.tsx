import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-[var(--radius-pill)] border border-[var(--warm-300)] bg-white px-4 py-2 text-sm text-[var(--warm-900)]",
          "placeholder:text-[var(--warm-500)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--warm-100)]",
          "transition-all duration-[var(--duration-fast)]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
