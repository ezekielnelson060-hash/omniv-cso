"use client";

import { useEffect, useRef } from "react";
import { recordSignal } from "@/lib/discovery/signals";
import { track } from "@/lib/analytics";

/**
 * Discovery analytics + interest signals.
 * Fires app_events: discovery_view / discovery_complete (columns: name, path, meta)
 * Mount once per publication or entity detail page.
 */
export function ViewTracker({
  tags = [],
  category,
  publicationSlug,
  entityType,
  entitySlug,
  dwellMs = 25_000,
}: {
  tags?: string[];
  category?: string;
  publicationSlug?: string;
  entityType?: string;
  entitySlug?: string;
  dwellMs?: number;
}) {
  const tagsKey = tags.join("|");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const tagList = tagsKey ? tagsKey.split("|").filter(Boolean) : [];

    const path =
      typeof window !== "undefined" ? window.location.pathname : undefined;

    recordSignal("open", tagList, category, { publicationSlug });

    track(
      "discovery_view",
      {
        kind: publicationSlug ? "publication" : entitySlug ? "entity" : "page",
        publication_slug: publicationSlug || null,
        entity_type: entityType || null,
        entity_slug: entitySlug || null,
        category: category || null,
        tags: tagList.slice(0, 12).join(","),
      },
      path
    );

    const t = window.setTimeout(() => {
      recordSignal("complete", tagList, category, { publicationSlug });
      track(
        "discovery_complete",
        {
          kind: publicationSlug ? "publication" : entitySlug ? "entity" : "page",
          publication_slug: publicationSlug || null,
          entity_type: entityType || null,
          entity_slug: entitySlug || null,
          dwell_ms: dwellMs,
        },
        path
      );
    }, dwellMs);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
