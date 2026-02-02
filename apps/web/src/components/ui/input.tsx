import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 border border-charcoal-text/10 rounded-xl text-charcoal-text placeholder:text-light-grey-text bg-white focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
