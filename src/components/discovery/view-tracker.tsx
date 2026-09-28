"use client";

import { useEffect, useRef } from "react";
import { recordSignal } from "@/lib/discovery/signals";

/**
 * Records open on mount and complete after meaningful dwell.
 * Mount once per publication detail page.
 */
export function ViewTracker({
  tags = [],
  category,
  publicationSlug,
  dwellMs = 25_000,
}: {
  tags?: string[];
  category?: string;
  publicationSlug?: string;
  dwellMs?: number;
}) {
  const tagsKey = tags.join("|");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const tagList = tagsKey ? tagsKey.split("|").filter(Boolean) : [];
    recordSignal("open", tagList, category, { publicationSlug });
    const t = window.setTimeout(() => {
      recordSignal("complete", tagList, category, { publicationSlug });
    }, dwellMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
