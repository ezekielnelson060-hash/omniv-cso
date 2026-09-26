"use client";

import { PublicationActions } from "@/components/discovery/publication-actions";
import { ShareButton } from "@/components/discovery/share-button";

export function PublicationPageActions({
  slug,
  type,
  title,
  path,
  publishedAt,
  heat,
}: {
  slug: string;
  type: string;
  title: string;
  path: string;
  publishedAt?: string | null;
  heat?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <PublicationActions
        slug={slug}
        type={type}
        title={title}
        publishedAt={publishedAt}
        initialLikes={heat ?? 0}
        compact
      />
      <ShareButton title={title} path={path} />
    </div>
  );
}
