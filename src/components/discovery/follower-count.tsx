"use client";

import { useEffect, useState } from "react";

export function FollowerCount({
  type,
  slug,
  className = "",
}: {
  type: string;
  slug: string;
  className?: string;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/discovery/followers?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`
        );
        const data = await res.json();
        if (!cancelled) setCount(typeof data.count === "number" ? data.count : 0);
      } catch {
        if (!cancelled) setCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  return (
    <span className={className}>
      <span className="text-[16px] font-semibold text-white">
        {count === null ? "·" : count}
      </span>{" "}
      <span className="text-[13px] text-zinc-500">Followers</span>
    </span>
  );
}
