"use client";

import { useEffect, useRef } from "react";
import { recordSignal } from "@/lib/discovery/signals";

/** Fire once per query string when Explore search results mount. */
export function SearchSignal({ query }: { query: string }) {
  const last = useRef("");

  useEffect(() => {
    const q = query.trim();
    if (!q || q === last.current) return;
    last.current = q;
    const tags = q
      .split(/[\s,+/]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1)
      .slice(0, 6);
    recordSignal("search", tags.length ? tags : [q.slice(0, 40)]);
  }, [query]);

  return null;
}
