"use client";

import Link from "next/link";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { ProfilePubMenu } from "@/components/discovery/profile-pub-menu";
import {
  VerifiedBadge,
  isAlwaysVerified,
} from "@/components/discovery/verified-badge";
import {
  PUBLICATION_LABELS,
  publicationPath,
  entityPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";
import { coverFor } from "@/lib/discovery/seed-covers";
import { cleanPublisherMeta } from "@/lib/discovery/publisher-meta";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";

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

export function PublicationCard({
  pub,
  showManage = false,
}: {
  pub: PubWithCover;
  showManage?: boolean;
}) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName || "Publisher";
  const cover = TONE[pub.type] ?? "from-zinc-800 to-zinc-950";
  const isMusic = pub.type === "music";
  const isEvent = pub.type === "event";
  const isOpp = pub.type === "opportunity";
  const coverSrc = pub.coverUrl || coverFor(pub.slug);
  const publisherHref =
    (publisher ? entityPath(publisher) : undefined) ||
    resolvePublisherPath({
      type: publisher?.type,
      slug: publisher?.slug,
      name,
      publisherId: pub.publisherId,
    });
  const displayMeta = cleanPublisherMeta(name, pub.meta);
  const showVerified = isAlwaysVerified({
    verified: publisher?.verified,
    slug: publisher?.slug,
    name: name,
  });
  const verifyType = publisher?.type || "company";
  const href = publicationPath(pub);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition-colors duration-200 hover:bg-[#101010]">
      <div className="relative">
        <Link href={href} prefetch className="group block">
          <div className="relative aspect-[16/10] overflow-hidden">
            {coverSrc ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${coverSrc})` }}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${cover}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
              {PUBLICATION_LABELS[pub.type as keyof typeof PUBLICATION_LABELS] ||
                pub.type}
            </span>
            {isMusic && (
              <span className="absolute bottom-3 right-3 text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
                Listen
              </span>
            )}
            {isEvent && (
              <span className="absolute bottom-3 right-3 text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
                Event
              </span>
            )}
            {isOpp && (
              <span className="absolute bottom-3 right-3 text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
                Open
              </span>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col px-3.5 pb-1 pt-3">
          <Link href={href} prefetch className="group">
            <p className="text-[15px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
              {pub.title}
            </p>
            {pub.summary && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                {pub.summary}
              </p>
            )}
          </Link>

          {/* Name · tick · meta as siblings on one row */}
          <div className="mt-2 flex min-w-0 items-center gap-1 text-[12px]">
            {publisherHref ? (
              <Link
                href={publisherHref}
                className="min-w-0 max-w-[45%] truncate text-[12px] font-semibold leading-none text-white hover:text-omniv-gold"
              >
                {name}
              </Link>
            ) : (
              <span className="min-w-0 max-w-[45%] truncate text-[12px] font-semibold leading-none text-white">
                {name}
              </span>
            )}
            {showVerified ? (
              <VerifiedBadge
                name={name}
                verifyType={verifyType}
                className="inline-flex shrink-0"
                size={13}
              />
            ) : null}
            {displayMeta ? (
              <>
                <span className="shrink-0 leading-none text-zinc-600">·</span>
                <span className="min-w-0 truncate leading-none text-zinc-500">
                  {displayMeta}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {pub.id && (
          <div className="absolute right-2 top-2 z-10">
            <div className="rounded-full bg-black/55 backdrop-blur-sm">
              <ProfilePubMenu
                id={pub.id}
                slug={pub.slug}
                type={pub.type}
                title={pub.title}
                mode={showManage ? "owner" : "visitor"}
              />
            </div>
          </div>
        )}
      </div>

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
