"use client";

import Link from "next/link";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { VerifiedBadge } from "@/components/discovery/verified-badge";
import {
  PUBLICATION_LABELS,
  publicationPath,
  entityPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";
import { coverFor } from "@/lib/discovery/seed-covers";
import { cleanPublisherMeta } from "@/lib/discovery/publisher-meta";

type PubWithCover = Publication & {
  coverUrl?: string;
  publisherName?: string;
};

const TONE: Record<string, string> = {
  article: "from-sky-900/80 to-slate-950",
  music: "from-fuchsia-900/70 to-purple-950",
  video: "from-rose-900/70 to-red-950",
  research: "from-emerald-900/60 to-teal-950",
  product: "from-amber-900/50 to-orange-950",
  event: "from-violet-900/60 to-indigo-950",
  announcement: "from-zinc-800/50 to-zinc-950",
  opportunity: "from-yellow-900/40 to-yellow-950",
  file: "from-cyan-900/50 to-slate-950",
};

export function PublicationCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = pub.publisherName || publisher?.name || "Publisher";
  const cover = TONE[pub.type] ?? "from-zinc-800 to-zinc-950";
  const isMusic = pub.type === "music";
  const isEvent = pub.type === "event";
  const isOpp = pub.type === "opportunity";
  const coverSrc = pub.coverUrl || coverFor(pub.slug);
  const publisherHref = publisher ? entityPath(publisher) : undefined;
  const displayMeta = cleanPublisherMeta(name, pub.meta);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition-colors duration-200 hover:bg-[#101010]">
      <Link href={publicationPath(pub)} prefetch className="group flex flex-1 flex-col">
        <div className="relative flex aspect-[16/10] items-end overflow-hidden">
          {coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${cover}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {PUBLICATION_LABELS[pub.type] ?? pub.type}
          </span>
          {isMusic && (
            <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
          {isEvent && pub.meta && (
            <span className="absolute right-2.5 top-2.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white/90">
              {pub.meta.split(" · ")[0]}
            </span>
          )}
          {isOpp && (
            <span className="absolute right-2.5 top-2.5 text-[10px] font-semibold uppercase tracking-wide text-omniv-gold">
              Open
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-3.5 pb-1 pt-3">
          <p className="text-[15px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
            {pub.title}
          </p>
          {pub.summary && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
              {pub.summary}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-[12px]">
            {publisherHref ? (
              <Link
                href={publisherHref}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex max-w-[70%] items-center gap-1 truncate font-semibold text-white hover:text-omniv-gold"
              >
                <span className="truncate">{name}</span>
                {publisher?.verified && (
                  <VerifiedBadge
                    name={publisher.name}
                    verifyType={publisher.type}
                    className="shrink-0"
                  />
                )}
              </Link>
            ) : (
              <span className="inline-flex max-w-[70%] items-center gap-1 truncate font-semibold text-white">
                <span className="truncate">{name}</span>
                {publisher?.verified && (
                  <VerifiedBadge
                    name={publisher.name}
                    verifyType={publisher.type}
                    className="shrink-0"
                  />
                )}
              </span>
            )}
            {displayMeta && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="truncate text-zinc-500">{displayMeta}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="border-t border-white/[0.04] px-2.5 py-1">
        <PublicationActions
          slug={pub.slug}
          type={pub.type}
          title={pub.title}
          publishedAt={pub.publishedAt}
          initialLikes={0}
          compact
        />
      </div>
    </div>
  );
}
