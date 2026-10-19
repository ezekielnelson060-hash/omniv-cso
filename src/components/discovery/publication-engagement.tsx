"use client";

import Link from "next/link";
import { MoreFromPublisher } from "@/components/discovery/more-from-publisher";
import { PublicationBottomActions } from "@/components/discovery/publication-cta-bar";
import { PUBLICATION_LABELS } from "@/lib/discovery/types";

type MoreItem = {
  slug: string;
  type: string;
  title: string;
  summary?: string | null;
  publisherName?: string | null;
  publisherSlug?: string | null;
  coverUrl?: string | null;
  mediaUrl?: string | null;
  publishedAt?: string | null;
};

/**
 * Order (fixed):
 * 1) This publication — play / watch / view / download
 * 2) More from publisher (2–3 other works)
 * 3) Save + Follow + Download CTAs
 */
export function PublicationEngagement({
  publicationType,
  publicationSlug,
  publicationTitle,
  mediaUrl,
  coverUrl,
  publisherName,
  publisherType,
  publisherSlug,
  publisherId,
  publisherHref,
  showFollow,
  moreItems,
}: {
  publicationType: string;
  publicationSlug: string;
  publicationTitle: string;
  mediaUrl?: string | null;
  coverUrl?: string | null;
  publisherName: string;
  publisherType: string;
  publisherSlug: string;
  publisherId?: string;
  publisherHref?: string | null;
  showFollow: boolean;
  moreItems: MoreItem[];
}) {
  const t = (publicationType || "article").toLowerCase();
  const label =
    PUBLICATION_LABELS[t as keyof typeof PUBLICATION_LABELS] || publicationType;
  const isMusic = t === "music";
  const isVideo = t === "video";
  const isDoc = t === "file" || t === "research";
  const hasMedia = Boolean(mediaUrl);

  // Never list the current publication under "More from…"
  const others = moreItems.filter((x) => x.slug !== publicationSlug).slice(0, 3);

  return (
    <div className="mt-10 space-y-2">
      {/* 1) This publication — interact without scrolling up */}
      <section className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.1]">
        <div className="flex items-center gap-3 p-3.5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-omniv-gold/25 to-zinc-900 text-xl text-omniv-gold">
                {isMusic ? "♪" : isVideo ? "▶" : isDoc ? "📄" : "A"}
              </div>
            )}
            {isVideo && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                ▶
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              This {label.toLowerCase()}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-semibold text-white">
              {publicationTitle}
            </p>
            <p className="mt-0.5 text-[12px] text-zinc-500">{publisherName}</p>
          </div>
        </div>

        {hasMedia && isMusic ? (
          <div className="border-t border-white/[0.06] px-3.5 py-3">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              controls
              src={mediaUrl!}
              preload="metadata"
              className="h-10 w-full"
              crossOrigin="anonymous"
            />
          </div>
        ) : null}

        {hasMedia && isVideo ? (
          <div className="border-t border-white/[0.06] px-3.5 py-3">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              src={mediaUrl!}
              preload="metadata"
              className="max-h-56 w-full rounded-lg bg-black"
              playsInline
            />
          </div>
        ) : null}

        {hasMedia && isDoc ? (
          <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-3.5 py-3">
            <a
              href={mediaUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black"
            >
              View document
            </a>
            <a
              href={mediaUrl!}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full bg-white/[0.08] px-4 text-[13px] font-semibold text-white ring-1 ring-white/12"
            >
              Download
            </a>
          </div>
        ) : null}

        {!hasMedia && !isMusic && !isVideo && !isDoc ? (
          <div className="border-t border-white/[0.06] px-3.5 py-3">
            <Link
              href={`#top`}
              className="text-[13px] font-medium text-omniv-gold hover:underline"
            >
              Read from the top →
            </Link>
          </div>
        ) : null}
      </section>

      {/* 2) Other works from this publisher */}
      <MoreFromPublisher
        publisherName={publisherName}
        profileHref={publisherHref}
        items={others}
      />

      {/* 3) Save / Follow / Download */}
      <PublicationBottomActions
        publicationType={publicationType}
        publicationSlug={publicationSlug}
        publicationTitle={publicationTitle}
        mediaUrl={mediaUrl}
        publisherName={publisherName}
        publisherType={publisherType}
        publisherSlug={publisherSlug}
        publisherId={publisherId}
        showFollow={showFollow}
      />
    </div>
  );
}
