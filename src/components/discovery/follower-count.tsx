"use client";

import { useCallback, useEffect, useState } from "react";

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

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/discovery/followers?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`
      );
      const data = await res.json();
      setCount(typeof data.count === "number" ? data.count : 0);
    } catch {
      setCount(0);
    }
  }, [type, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onFollow(e: Event) {
      const ce = e as CustomEvent<{ type: string; slug: string }>;
      if (ce.detail?.type === type && ce.detail?.slug === slug) {
        // brief delay so DB write lands
        setTimeout(() => void load(), 200);
      }
    }
    window.addEventListener("omniv-follow-change", onFollow);
    return () => window.removeEventListener("omniv-follow-change", onFollow);
  }, [type, slug, load]);

  return (
    <span className={className}>
      <span className="text-[16px] font-semibold text-white">
        {count === null ? "·" : count}
      </span>{" "}
      <span className="text-[13px] text-zinc-500">Followers</span>
    </span>
  );
}
