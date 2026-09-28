"use client";

import { useState } from "react";
import {
  INTEREST_GROUPS,
  readInterests,
  writeInterests,
} from "@/lib/discovery/interests";

export function InterestPicker({ onDone }: { onDone?: () => void }) {
  const [selected, setSelected] = useState<string[]>(() => readInterests());

  function toggle(item: string) {
    setSelected((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : current.length >= 10
          ? current
          : [...current, item]
    );
  }

  function finish() {
    writeInterests(selected);
    onDone?.();
  }

  return (
    <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-white">What do you want to discover?</p>
          <p className="mt-1 text-[12px] text-zinc-500">Choose up to 10. You can change this later.</p>
        </div>
        <span className="text-[12px] text-zinc-500">{selected.length}/10</span>
      </div>
      <div className="mt-4 space-y-4">
        {INTEREST_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const active = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggle(item)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1.5 text-[12px] transition ${
                      active
                        ? "bg-omniv-gold text-black"
                        : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={finish}
        disabled={!selected.length}
        className="mt-5 h-10 rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Shape my feed
      </button>
    </section>
  );
}
