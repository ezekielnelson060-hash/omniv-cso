"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Compact 2026-style page header */
export function PageChrome({
  eyebrow,
  title,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-14 z-20 -mx-3 flex flex-wrap items-center gap-2 border-y border-omniv-border bg-omniv-elevated/95 px-3 py-2 backdrop-blur md:top-0 md:mx-0 md:rounded-xl md:border",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
            value === o.id
              ? "bg-omniv-gold text-omniv-black"
              : "bg-omniv-hover text-omniv-text-secondary hover:text-omniv-text"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
