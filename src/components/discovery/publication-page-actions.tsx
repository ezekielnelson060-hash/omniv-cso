"use client";

import Link from "next/link";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { ShareButton } from "@/components/discovery/share-button";
import { ViewTracker } from "@/components/discovery/view-tracker";

/**
 * Engagement + publisher control bar.
 * Like · Save · Share · ⚡ Promote
 * Promote is always one tap away on the publication itself.
 */
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
  isOwner?: boolean;
}) {
  return (
    <>
      <ViewTracker
        tags={tags}
        category={category || type}
        publicationSlug={slug}
      />
      <div className="flex flex-wrap items-center gap-1.5">
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
        <Link
          href={`/promote?slug=${encodeURIComponent(slug)}`}
          className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-omniv-gold px-3.5 text-[12px] font-semibold text-black shadow-sm shadow-omniv-gold/20 transition hover:brightness-110"
        >
          <span aria-hidden>⚡</span>
          Promote
        </Link>
      </div>
    </>
  );
}
