"use client";

import { useEffect } from "react";
import {
  PUBLICATION_TYPES,
  type PublicationType,
} from "@/lib/discovery/types";

/** Apply /publish?type=article from the Create sheet */
export function PublishTypeBoot({
  onType,
}: {
  onType: (t: PublicationType) => void;
}) {
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("type");
      if (t && (PUBLICATION_TYPES as readonly string[]).includes(t)) {
        onType(t as PublicationType);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
