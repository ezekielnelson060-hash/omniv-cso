"use client";

import { useEffect, useState } from "react";

const KEY = "omniv_saved";

export type SavedRef = { type: string; slug: string; name: string };

export function readSaved(): SavedRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedRef[]) : [];
  } catch {
    return [];
  }
}

function writeSaved(items: SavedRef[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function SaveButton({
  type,
  slug,
  name,
}: {
  type: string;
  slug: string;
  name: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = readSaved();
    setSaved(list.some((x) => x.type === type && x.slug === slug));
  }, [type, slug]);

  function toggle() {
    const list = readSaved();
    const i = list.findIndex((x) => x.type === type && x.slug === slug);
    if (i >= 0) {
      list.splice(i, 1);
      setSaved(false);
    } else {
      list.unshift({ type, slug, name });
      setSaved(true);
    }
    writeSaved(list.slice(0, 100));
  }

  return (
    <button
      type="button"
      onClick={toggle}
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
