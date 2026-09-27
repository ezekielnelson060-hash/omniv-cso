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

/** Soft engagement — heart */
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
    <div className="mt-2.5 flex items-center gap-5 text-[13px] text-zinc-500">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        className={`inline-flex items-center gap-1.5 transition ${
          liked ? "text-rose-400" : "hover:text-zinc-300"
        }`}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M12 21s-7-4.4-9.5-8.2C.7 9.8 2.2 6 6 6c2 0 3.4 1.2 4 2.2.6-1 2-2.2 4-2.2 3.8 0 5.3 3.8 3.5 6.8C19 16.6 12 21 12 21z"
            strokeLinejoin="round"
          />
        </svg>
        {count > 0 && <span>{count}</span>}
      </button>
    </div>
  );
}
