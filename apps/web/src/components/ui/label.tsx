import { forwardRef, type LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-semibold text-charcoal-text mb-2 ${className}`}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
