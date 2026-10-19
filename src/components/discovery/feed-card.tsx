import Link from "next/link";
import {
  PUBLICATION_LABELS,
  publicationPath,
  entityPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";
import { coverFor } from "@/lib/discovery/seed-covers";
import { PublicationActions } from "@/components/discovery/publication-actions";
import {
  VerifiedBadge,
  isAlwaysVerified,
} from "@/components/discovery/verified-badge";
import { cleanPublisherMeta } from "@/lib/discovery/publisher-meta";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";

type PubWithCover = Publication & {
  coverUrl?: string;
  publisherName?: string;
  publisherSlug?: string;
};

const TONE: Record<string, string> = {
  article: "from-sky-900/90 via-slate-950 to-black",
  music: "from-fuchsia-900/80 via-purple-950 to-black",
  video: "from-rose-900/80 via-red-950 to-black",
  research: "from-emerald-900/70 via-teal-950 to-black",
  product: "from-amber-900/60 via-orange-950 to-black",
  event: "from-violet-900/70 via-indigo-950 to-black",
  announcement: "from-zinc-800/50 via-zinc-950 to-black",
  opportunity: "from-yellow-900/40 via-yellow-950 to-black",
  file: "from-cyan-900/60 via-slate-950 to-black",
};

function CoverBg({
  pub,
  className,
}: {
  pub: PubWithCover;
  className?: string;
}) {
  const cover = TONE[pub.type] ?? "from-zinc-800 to-black";
  if (pub.coverUrl) {
    return (
      <div
        className={className}
        style={{
          backgroundImage: `url(${pub.coverUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }
  return <div className={`${className} bg-gradient-to-br ${cover}`} />;
}

function TypeLabel({ type }: { type: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
      {PUBLICATION_LABELS[type as keyof typeof PUBLICATION_LABELS] ?? type}
    </span>
  );
}

function durationFromMeta(meta: string | undefined | null): string | null {
  if (!meta) return null;
  try {
    const o = JSON.parse(meta);
    const d = o?.duration;
    if (d != null && String(d).trim()) return String(d).trim();
  } catch {
    /* ignore */
  }
  return null;
}

function pathFor(pub: PubWithCover, publisher?: ReturnType<typeof getEntityById>) {
  return publicationPath({
    slug: pub.slug,
    type: pub.type,
    publisherSlug: pub.publisherSlug || publisher?.slug,
    publisherName: pub.publisherName || publisher?.name,
  });
}

function PublisherLine({
  name,
  publisher,
  meta,
  light,
}: {
  name?: string;
  publisher?: ReturnType<typeof getEntityById>;
  meta?: string;
  light?: boolean;
}) {
  if (!name) return null;
  const href =
    (publisher ? entityPath(publisher) : undefined) ||
    resolvePublisherPath({
      type: publisher?.type,
      slug: publisher?.slug,
      name,
    });
  const nameClass = light
    ? "font-semibold text-white/90"
    : "font-semibold text-white";
  const metaClass = light ? "text-white/50" : "text-zinc-500";
  const displayMeta = cleanPublisherMeta(name, meta);
  const showVerified = isAlwaysVerified({
    verified: publisher?.verified,
    slug: publisher?.slug,
    name,
  });

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1 text-[12px]">
      {href ? (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          data-inline
          className={`inline-link min-h-0 min-w-0 max-w-[45%] truncate leading-none ${nameClass} hover:text-omniv-gold`}
        >
          {name}
        </Link>
      ) : (
        <span
          className={`inline-link min-h-0 min-w-0 max-w-[45%] truncate leading-none ${nameClass}`}
        >
          {name}
        </span>
      )}
      {showVerified ? (
        <VerifiedBadge
          name={name}
          verifyType={publisher?.type || "company"}
          className="inline-flex shrink-0"
          size={13}
        />
      ) : null}
      {displayMeta ? (
        <>
          <span
            className={`shrink-0 leading-none ${light ? "text-white/40" : "text-zinc-600"}`}
          >
            ·
          </span>
          <span className={`min-w-0 truncate leading-none ${metaClass}`}>
            {displayMeta}
          </span>
        </>
      ) : null}
    </div>
  );
}

/** Music — compact horizontal card with square art + play */
function MusicFeedCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);
  const href = pathFor(pub, publisher);
  const dur = durationFromMeta(pub.meta);

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06]">
      <Link href={href} className="group flex items-center gap-3 p-3">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-90 transition group-hover:bg-black/45">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-omniv-gold text-black shadow-lg">
              <span className="ml-0.5 text-sm leading-none">▶</span>
            </span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Music
          </span>
          <p className="mt-0.5 truncate text-[15px] font-semibold text-white group-hover:text-omniv-gold">
            {pub.title}
          </p>
          <div className="mt-1">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {dur ? `${dur} · Listen` : "Listen"}
          </p>
        </div>
      </Link>
      <div className="border-t border-white/[0.05] px-3 py-1.5">
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

/** Video — large cover with centered play */
function VideoFeedCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);
  const href = pathFor(pub, publisher);
  const dur = durationFromMeta(pub.meta);

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0c0c0c]">
      <Link href={href} className="group block">
        <div className="relative aspect-video">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 backdrop-blur-sm">
            <TypeLabel type="video" />
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow-xl ring-1 ring-white/30 backdrop-blur-sm transition group-hover:scale-105">
              <span className="ml-1 text-xl leading-none">▶</span>
            </span>
          </span>
          {dur ? (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {dur}
            </span>
          ) : null}
        </div>
        <div className="px-4 pt-3">
          <p className="text-[16px] font-semibold leading-snug text-white group-hover:text-omniv-gold">
            {pub.title}
          </p>
          <div className="mt-2">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
        </div>
      </Link>
      <div className="px-3 pb-2 pt-1">
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

/** PDF / research — document-style card */
function FileFeedCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const href = pathFor(pub, publisher);
  const label =
    PUBLICATION_LABELS[pub.type as keyof typeof PUBLICATION_LABELS] || "File";

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06]">
      <Link href={href} className="group flex gap-3 p-3.5">
        <div className="flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-700/80 to-orange-950 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wide">PDF</span>
          <span className="mt-1 text-2xl leading-none">📄</span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-400/90">
            {label}
          </span>
          <p className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-white group-hover:text-omniv-gold">
            {pub.title}
          </p>
          <div className="mt-1.5">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-zinc-500">View · Download</p>
        </div>
      </Link>
      <div className="border-t border-white/[0.05] px-3 py-1.5">
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

export function FeedFeaturedCard({
  pub,
  showExplore,
}: {
  pub: PubWithCover;
  showExplore?: boolean;
}) {
  if (pub.type === "music") return <MusicFeedCard pub={pub} />;
  if (pub.type === "video") return <VideoFeedCard pub={pub} />;
  if (pub.type === "file" || pub.type === "research")
    return <FileFeedCard pub={pub} />;

  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);
  const href = pathFor(pub, publisher);

  return (
    <article className="overflow-hidden rounded-2xl bg-[#0c0c0c]">
      <Link
        href={href}
        className="group block transition-opacity duration-200 hover:opacity-[0.97]"
      >
        <div className="relative aspect-[5/4] sm:aspect-[16/10]">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 backdrop-blur-sm">
            <TypeLabel type={pub.type} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight text-white">
              {pub.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/70">
              {pub.summary}
            </p>
            <div className="mt-2">
              <PublisherLine
                name={name}
                publisher={publisher}
                meta={pub.meta}
                light
              />
            </div>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-2 pt-1">
        <PublicationActions
          slug={pub.slug}
          type={pub.type}
          title={pub.title}
          publishedAt={pub.publishedAt}
          initialLikes={0}
          compact
        />
      </div>
      {showExplore && (
        <div className="border-t border-white/[0.05] px-4 py-2 text-right">
          <Link
            href="/explore"
            className="text-[12px] font-medium text-omniv-gold"
          >
            Explore
          </Link>
        </div>
      )}
    </article>
  );
}

export function FeedCompactRow({ pub }: { pub: PubWithCover }) {
  if (pub.type === "music") return <MusicFeedCard pub={pub} />;
  if (pub.type === "video") return <VideoFeedCard pub={pub} />;
  if (pub.type === "file" || pub.type === "research")
    return <FileFeedCard pub={pub} />;

  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);
  const href = pathFor(pub, publisher);

  return (
    <article className="rounded-2xl bg-[#0c0c0c]">
      <Link href={href} className="group flex items-center gap-3 px-1 py-1">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
        </div>
        <div className="min-w-0 flex-1 py-2 pr-2">
          <p className="truncate text-[14px] font-semibold text-white">
            {pub.title}
          </p>
          <div className="mt-1">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
        </div>
      </Link>
    </article>
  );
}

export function FeedCard({ pub }: { pub: PubWithCover }) {
  if (pub.type === "music") return <MusicFeedCard pub={pub} />;
  if (pub.type === "video") return <VideoFeedCard pub={pub} />;
  if (pub.type === "file" || pub.type === "research")
    return <FileFeedCard pub={pub} />;

  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);
  const href = pathFor(pub, publisher);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] transition-colors duration-200 hover:bg-[#101010]">
      <Link href={href} className="group flex flex-1 flex-col">
        <div className="relative aspect-[16/10]">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute left-3 top-3">
            <TypeLabel type={pub.type} />
          </span>
        </div>
        <div className="flex flex-1 flex-col px-4 pt-3.5">
          <p className="text-[16px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
            {pub.title}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
            {pub.summary}
          </p>
          <div className="mt-auto pt-3">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
        </div>
      </Link>
      <div className="px-3 pb-2">
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
