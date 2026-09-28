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
        className="text-[11px] text-zinc-600 transition hover:text-zinc-400"
      >
        Why am I seeing this?{" "}
        <span className="text-zinc-700">{open ? "↑" : "↓"}</span>
      </button>
      {open && (
        <p className="mt-1 max-w-[280px] text-[11px] leading-relaxed text-zinc-500">
          {reason}
        </p>
      )}
    </span>
  );
}
