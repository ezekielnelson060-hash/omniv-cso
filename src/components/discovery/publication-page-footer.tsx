"use client";

import Link from "next/link";
import { PublicationBottomActions } from "@/components/discovery/publication-cta-bar";
import { MoreFromPublisher } from "@/components/discovery/more-from-publisher";
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
 * End-of-page block so explorers can play / watch / download / save this
 * publication again after scrolling through related content.
 */
export function PublicationPageFooter({
  title,
  type,
  slug,
  coverUrl,
  mediaUrl,
  path,
  publisherName,
  publisherType,
  publisherSlug,
  publisherId,
  publisherHref,
  showFollow,
  moreItems,
}: {
  title: string;
  type: string;
  slug: string;
  coverUrl?: string | null;
  mediaUrl?: string | null;
  path: string;
  publisherName: string;
  publisherType: string;
  publisherSlug: string;
  publisherId?: string;
  publisherHref?: string | null;
  showFollow: boolean;
  moreItems: MoreItem[];
}) {
  const label =
    PUBLICATION_LABELS[type as keyof typeof PUBLICATION_LABELS] || type;
  const isMusic = type === "music";
  const isVideo = type === "video";
  const isFile = type === "file" || type === "research";
  const hasMedia = Boolean(mediaUrl);

  return (
    <section className="mt-14 border-t border-white/[0.08] pt-10">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
        This {label.toLowerCase()}
      </p>
      <p className="mt-1 text-center text-[13px] text-zinc-500">
        Play, save, or download without scrolling back up
      </p>

      {/* Compact card for the current publication */}
      <div className="mt-5 overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.1]">
        <div className="flex items-center gap-3 p-3.5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-omniv-gold/30 to-zinc-900 text-xl text-omniv-gold">
                {isMusic ? "♪" : isVideo ? "▶" : isFile ? "📄" : "A"}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              {publisherName} · {label}
            </p>
          </div>
        </div>

        {hasMedia && (isMusic || isVideo) ? (
          <div className="border-t border-white/[0.06] px-3.5 py-3">
            {isMusic ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio
                controls
                src={mediaUrl!}
                preload="metadata"
                className="h-10 w-full"
                crossOrigin="anonymous"
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                controls
                src={mediaUrl!}
                preload="metadata"
                className="max-h-48 w-full rounded-lg bg-black"
                playsInline
              />
            )}
          </div>
        ) : null}

        {!hasMedia && !isMusic && !isVideo ? (
          <div className="border-t border-white/[0.06] px-3.5 py-3">
            <Link
              href={path}
              className="text-[13px] font-medium text-omniv-gold hover:underline"
            >
              Read from the top →
            </Link>
          </div>
        ) : null}
      </div>

      <MoreFromPublisher
        publisherName={publisherName}
        profileHref={publisherHref}
        items={moreItems}
      />

      <PublicationBottomActions
        publicationType={type}
        publicationSlug={slug}
        publicationTitle={title}
        mediaUrl={mediaUrl}
        publisherName={publisherName}
        publisherType={publisherType}
        publisherSlug={publisherSlug}
        publisherId={publisherId}
        showFollow={showFollow}
      />
    </section>
  );
}
