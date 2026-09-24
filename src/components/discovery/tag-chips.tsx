"use client";

import { useState } from "react";

export function TagChips({
  value,
  onChange,
  suggestions = ["AI", "Africa", "Technology", "Music", "Research"],
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    const next = [...tags, t].slice(0, 12);
    onChange(next.join(", "));
    setDraft("");
  }

  function remove(tag: string) {
    onChange(tags.filter((x) => x !== tag).join(", "));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => remove(t)}
            className="inline-flex items-center gap-1 rounded-full bg-omniv-gold/15 px-2.5 py-1 text-[12px] font-medium text-omniv-gold ring-1 ring-omniv-gold/30"
          >
            {t}
            <span className="text-omniv-gold/70">×</span>
          </button>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={tags.length ? "+" : "Add tag"}
          className="h-8 min-w-[72px] flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
            .slice(0, 6)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="rounded-full px-2.5 py-1 text-[11px] text-zinc-500 ring-1 ring-white/10 hover:text-white"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
