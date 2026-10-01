"use client";

import { ViewTracker } from "@/components/discovery/view-tracker";

export function EntityViewTracker({
  type,
  slug,
  tags = [],
}: {
  type: string;
  slug: string;
  tags?: string[];
}) {
  return (
    <ViewTracker
      entityType={type}
      entitySlug={slug}
      category={type}
      tags={tags}
    />
  );
}
