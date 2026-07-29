"use client";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-omniv-gold transition-all duration-500",
          barClassName
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
