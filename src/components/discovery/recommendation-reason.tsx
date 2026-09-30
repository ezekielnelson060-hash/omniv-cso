"use client";

import { useState } from "react";

export function RecommendationReason({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-[12px] font-medium text-zinc-400 transition hover:text-omniv-gold"
      >
        Why am I seeing this?{" "}
        <span className="text-zinc-500">{open ? "↑" : "↓"}</span>
      </button>
      {open && (
        <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-zinc-400">
          {reason}
        </p>
      )}
    </span>
  );
}
