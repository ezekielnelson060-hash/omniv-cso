"use client";

import { cn, scoreColor } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreCardProps {
  label: string;
  value: number;
  delta?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreCard({
  label,
  value,
  delta,
  className,
  size = "md",
}: ScoreCardProps) {
  const TrendIcon =
    delta === undefined || delta === 0
      ? Minus
      : delta > 0
        ? TrendingUp
        : TrendingDown;

  return (
    <div
      className={cn(
        "card-elevated flex flex-col justify-between p-4",
        size === "lg" && "p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
          {label}
        </p>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-medium",
              delta > 0
                ? "text-omniv-success"
                : delta < 0
                  ? "text-omniv-danger"
                  : "text-omniv-text-muted"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span
          className={cn(
            "font-semibold tracking-tight",
            size === "lg" ? "text-4xl" : "text-3xl",
            scoreColor(value)
          )}
        >
          {value}
        </span>
        <span className="mb-1 text-xs text-omniv-text-muted">/100</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            value >= 80
              ? "bg-omniv-success"
              : value >= 60
                ? "bg-omniv-gold"
                : value >= 40
                  ? "bg-omniv-warning"
                  : "bg-omniv-danger"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
