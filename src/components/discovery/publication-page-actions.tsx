"use client";

import { PublicationActions } from "@/components/discovery/publication-actions";
import { ShareButton } from "@/components/discovery/share-button";
import { ViewTracker } from "@/components/discovery/view-tracker";

export function PublicationPageActions({
  slug,
  type,
  title,
  path,
  publishedAt,
  heat,
  tags = [],
  category,
}: {
  slug: string;
  type: string;
  title: string;
  path: string;
  publishedAt?: string | null;
  heat?: number;
  tags?: string[];
  category?: string;
}) {
  return (
    <>
      <ViewTracker tags={tags} category={category || type} />
      <div className="flex items-center gap-1">
        <PublicationActions
          slug={slug}
          type={type}
          title={title}
          publishedAt={publishedAt}
          initialLikes={heat ?? 0}
          compact
          tags={tags}
          category={category || type}
        />
        <ShareButton title={title} path={path} />
      </div>
    </>
  );
}
