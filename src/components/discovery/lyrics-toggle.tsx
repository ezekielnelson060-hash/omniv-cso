"use client";

import { useState } from "react";

export function LyricsToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.08] transition hover:ring-white/15"
        aria-expanded={open}
      >
        <span className="text-[13px] font-semibold uppercase tracking-wide text-zinc-300">
          Lyrics
        </span>
        <span className="text-[13px] text-omniv-gold">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? <div className="mt-4 px-1">{children}</div> : null}
    </div>
  );
}
