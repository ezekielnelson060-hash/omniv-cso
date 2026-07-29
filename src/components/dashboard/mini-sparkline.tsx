"use client";

import { cn } from "@/lib/utils";

interface MiniSparklineProps {
  data: number[];
  className?: string;
  strokeClassName?: string;
}

export function MiniSparkline({
  data,
  className,
  strokeClassName = "stroke-omniv-gold",
}: MiniSparklineProps) {
  if (data.length < 2) return null;

  const w = 120;
  const h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1, max - min);

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-9 w-full", className)}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        className={cn(strokeClassName)}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
