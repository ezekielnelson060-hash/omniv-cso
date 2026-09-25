"use client";

import { useEffect, useState } from "react";

const KEY = "omniv-likes";

function readLikes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLikes(m: Record<string, number>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

/** Soft engagement row — mockup heart / comment styling */
export function ProfileEngagement({
  slug,
  seedLikes = 0,
}: {
  slug: string;
  seedLikes?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(seedLikes);

  useEffect(() => {
    const m = readLikes();
    if (m[slug] != null) {
      setCount(m[slug]);
      setLiked(m[slug] > seedLikes);
    }
  }, [slug, seedLikes]);

  function toggle() {
    const m = readLikes();
    const nextLiked = !liked;
    const next = nextLiked
      ? Math.max(count, seedLikes) + (liked ? 0 : 1)
      : Math.max(seedLikes, count - 1);
    m[slug] = next;
    writeLikes(m);
    setLiked(nextLiked);
    setCount(next);
  }

  return (
    <div className="mt-2 flex items-center gap-4 text-[12px] text-zinc-500">
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-1 transition ${
          liked ? "text-rose-400" : "hover:text-zinc-300"
        }`}
      >
        <span>{liked ? "♥" : "♡"}</span>
        <span>{count || ""}</span>
      </button>
      <span className="inline-flex items-center gap-1">
        <span>💬</span>
        <span>—</span>
      </span>
    </div>
  );
}
