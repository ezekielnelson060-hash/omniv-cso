"use client";

import { useEffect, useState } from "react";
import {
  isSaved,
  toggleSave,
  readSaved,
  type SavedItem,
} from "@/lib/discovery/local-graph";
import { recordSignal } from "@/lib/discovery/signals";

export type SavedRef = { type: string; slug: string; name: string };

export function readSavedLegacy(): SavedRef[] {
  return readSaved()
    .filter((x) => x.kind === "entity")
    .map((x) => ({ type: x.type, slug: x.slug, name: x.name }));
}

export { readSaved };

export function SaveButton({
  kind = "entity",
  type,
  slug,
  name,
  pubType,
  variant = "button",
}: {
  kind?: "entity" | "publication";
  type: string;
  slug: string;
  name: string;
  pubType?: string;
  variant?: "button" | "icon";
}) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/save");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.saves)) {
          setSaved(
            data.saves.some(
              (x: SavedItem) =>
                x.kind === kind && x.type === type && x.slug === slug
            )
          );
        } else {
          setSaved(isSaved(kind, type, slug));
        }
      } catch {
        if (!cancelled) setSaved(isSaved(kind, type, slug));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, type, slug]);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    const item: SavedItem = { kind, type, slug, name, pubType };
    try {
      const res = await fetch("/api/discovery/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.status === 401) {
        const next = toggleSave(item);
        setSaved(next);
        if (next) recordSignal("save", [type, pubType || ""].filter(Boolean));
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setSaved(Boolean(data.saved));
        const local = isSaved(kind, type, slug);
        if (data.saved !== local) toggleSave(item);
        if (data.saved) recordSignal("save", [type, pubType || ""].filter(Boolean));
      } else {
        const next = toggleSave(item);
        setSaved(next);
        if (next) recordSignal("save", [type, pubType || ""].filter(Boolean));
      }
    } catch {
      const next = toggleSave(item);
      setSaved(next);
      if (next) recordSignal("save", [type, pubType || ""].filter(Boolean));
    } finally {
      setBusy(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!ready || busy}
        aria-label={saved ? "Unsave" : "Save"}
        className={`inline-flex items-center rounded-full p-1.5 transition active:scale-95 ${
          saved
            ? "text-omniv-gold"
            : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
        }`}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.2L6 21V4.5a1 1 0 0 1 1-1z"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready || busy}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition ${
        saved
          ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/30"
          : "bg-white/[0.06] text-white ring-1 ring-white/10 hover:bg-white/[0.1]"
      }`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
