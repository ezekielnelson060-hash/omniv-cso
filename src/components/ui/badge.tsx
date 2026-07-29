import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "outline" | "success" | "warning" | "danger";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-omniv-text-secondary border-omniv-border",
    gold: "bg-omniv-gold/15 text-omniv-gold border-omniv-gold/25",
    outline: "bg-transparent text-omniv-text-secondary border-omniv-border",
    success: "bg-omniv-success/10 text-omniv-success border-omniv-success/20",
    warning: "bg-omniv-warning/10 text-omniv-warning border-omniv-warning/20",
    danger: "bg-omniv-danger/10 text-omniv-danger border-omniv-danger/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
