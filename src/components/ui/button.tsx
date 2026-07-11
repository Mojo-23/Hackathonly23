import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control border border-transparent text-body-sm font-medium transition-colors duration-[var(--motion-fast)] disabled:pointer-events-none disabled:opacity-40 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-tint focus-visible:ring-offset-2 focus-visible:ring-offset-background-default",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-hover",
        secondary:
          "border-border-strong bg-background-default text-text-primary hover:border-text-tertiary active:bg-background-sunken",
        ghost:
          "bg-transparent text-text-secondary hover:bg-background-sunken hover:text-text-primary active:bg-background-sunken",
        destructive:
          "bg-status-error-fg text-text-inverse hover:brightness-90 active:brightness-90",
      },
      size: {
        sm: "h-8 px-3 text-label",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <span
          className="size-4 animate-spin rounded-pill border-2 border-current border-t-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}

export { buttonVariants };
