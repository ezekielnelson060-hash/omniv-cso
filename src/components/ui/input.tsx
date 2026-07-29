"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-omniv-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-[var(--radius)] border bg-omniv-elevated px-3.5 text-sm text-omniv-text placeholder:text-omniv-text-muted",
            "transition-colors duration-200 focus-gold",
            "border-omniv-border hover:border-omniv-border-subtle focus:border-omniv-gold/50",
            error && "border-omniv-danger/50 focus:border-omniv-danger",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-omniv-danger animate-fade-in-up">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-omniv-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
