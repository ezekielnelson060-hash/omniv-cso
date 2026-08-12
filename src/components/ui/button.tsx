"use client";

import {
  forwardRef,
  isValidElement,
  cloneElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  /** When true, styles the single child element (e.g. Link) instead of a button */
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-gold disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-omniv-gold text-omniv-black hover:bg-[#e0bc45] shadow-[0_0_20px_-4px_rgba(212,175,55,0.4)] hover:shadow-[0_0_28px_-2px_rgba(212,175,55,0.5)]",
      secondary:
        "bg-omniv-card text-omniv-text border border-omniv-border hover:bg-omniv-hover hover:border-omniv-border-subtle",
      ghost:
        "text-omniv-text-secondary hover:text-omniv-text hover:bg-white/[0.04]",
      outline:
        "border border-omniv-border text-omniv-text hover:border-omniv-gold/40 hover:bg-omniv-gold/5",
      danger:
        "bg-omniv-danger/10 text-omniv-danger border border-omniv-danger/20 hover:bg-omniv-danger/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
      md: "h-10 px-4 text-sm rounded-[var(--radius)]",
      lg: "h-12 px-6 text-base rounded-[var(--radius)]",
      icon: "h-10 w-10 rounded-[var(--radius)]",
    };

    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
