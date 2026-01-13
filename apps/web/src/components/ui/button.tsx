"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--terracotta-500)] text-white hover:bg-[var(--terracotta-600)] active:scale-[0.98]",
        secondary:
          "bg-[var(--sage-500)] text-white hover:bg-[var(--sage-600)] active:scale-[0.98]",
        outline:
          "border-2 border-[var(--warm-300)] bg-transparent text-[var(--warm-800)] hover:bg-[var(--warm-100)] active:scale-[0.98]",
        ghost:
          "bg-transparent text-[var(--warm-700)] hover:bg-[var(--warm-100)] active:scale-[0.98]",
        destructive:
          "bg-[var(--color-error)] text-white hover:bg-red-600 active:scale-[0.98]",
        link: "text-[var(--terracotta-600)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-[var(--radius-pill)]",
        md: "rounded-[var(--radius-md)]",
        lg: "rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
