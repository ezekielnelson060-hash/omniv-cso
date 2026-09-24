"use client";

import { useEffect, useState } from "react";
import {
  isSaved,
  toggleSave,
  readSaved,
  type SavedItem,
} from "@/lib/discovery/local-graph";

/** @deprecated use SavedItem from local-graph */
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

  useEffect(() => {
    setSaved(isSaved(kind, type, slug));
    setReady(true);
  }, [kind, type, slug]);

  function onClick() {
    const item: SavedItem = { kind, type, slug, name, pubType };
    setSaved(toggleSave(item));
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!ready}
        aria-label={saved ? "Unsave" : "Save"}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
          saved
            ? "bg-omniv-gold/20 text-omniv-gold"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M6 4h12a1 1 0 0 1 1 1v15l-7-3.5L5 20V5a1 1 0 0 1 1-1z"
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
      disabled={!ready}
      className={`inline-flex h-11 items-center rounded-full border px-5 text-[13px] transition ${
        saved
          ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
          : "border-white/15 text-zinc-300 hover:border-white/30"
      }`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
