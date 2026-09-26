import Link from "next/link";
import {
  PUBLICATION_LABELS,
  publicationPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";

type PubWithCover = Publication & {
  coverUrl?: string;
  publisherName?: string;
};

const TONE: Record<string, string> = {
  article: "from-sky-700/80 via-slate-900 to-black",
  music: "from-fuchsia-600/70 via-purple-950 to-black",
  video: "from-rose-600/70 via-red-950 to-black",
  research: "from-emerald-600/60 via-teal-950 to-black",
  product: "from-amber-500/50 via-orange-950 to-black",
  event: "from-violet-600/60 via-indigo-950 to-black",
  announcement: "from-zinc-600/40 via-zinc-900 to-black",
  opportunity: "from-omniv-gold/35 via-yellow-950 to-black",
  file: "from-cyan-700/50 via-slate-900 to-black",
};

const TYPE_MARK: Record<string, string> = {
  article: "●",
  music: "♫",
  video: "▶",
  research: "▣",
  product: "◇",
  event: "▦",
  opportunity: "◎",
  announcement: "◦",
  file: "▤",
};

function CoverBg({
  pub,
  className,
}: {
  pub: PubWithCover;
  className?: string;
}) {
  const cover = TONE[pub.type] ?? "from-zinc-700 to-black";
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
    <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
      <span className="opacity-80">{TYPE_MARK[type] ?? "·"}</span>
      {PUBLICATION_LABELS[type as keyof typeof PUBLICATION_LABELS] ?? type}
    </span>
  );
}

/** Large hero — articles / research / video */
export function FeedFeaturedCard({
  pub,
  showExplore,
}: {
  pub: PubWithCover;
  showExplore?: boolean;
}) {
  const publisher = getEntityById(pub.publisherId);
  const name = pub.publisherName || publisher?.name;
  const tags = (pub.tags || []).slice(0, 5);

  return (
    <article className="overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06]">
      <Link
        href={publicationPath(pub)}
        className="group block transition hover:opacity-[0.98]"
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/10]">
          <CoverBg pub={pub} className="absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
          <div className="absolute left-3 top-3">
            <TypeLabel type={pub.type} />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-16">
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
              {pub.title}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-[13px] text-zinc-300">
              {name && (
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-omniv-gold/20 text-[9px] font-bold text-omniv-gold">
                    {name.charAt(0)}
                  </span>
                  {name}
                </span>
              )}
              {pub.meta && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{pub.meta}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
      {showExplore && tags.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
            Explore
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/explore?q=${encodeURIComponent(t)}`}
                className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-400 ring-1 ring-white/[0.08] hover:text-white"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

/** Compact — music, product, opportunity, event */
export function FeedCompactCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = pub.publisherName || publisher?.name;
  const isMusic = pub.type === "music";
  const isProduct = pub.type === "product";
  const isEvent = pub.type === "event";
  const datePart = isEvent && pub.meta ? pub.meta.split("·")[0]?.trim() : null;

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-[#0c0c0c] p-2.5 ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      {isEvent && datePart ? (
        <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-xl bg-violet-950/80 ring-1 ring-violet-500/30">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-300">
            Event
          </span>
          <span className="mt-0.5 text-center text-[11px] font-semibold leading-tight text-white">
            {datePart.slice(0, 12)}
          </span>
        </div>
      ) : (
        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl">
          <CoverBg pub={pub} className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            {isMusic ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            ) : isProduct ? (
              <span className="text-2xl text-omniv-gold/90">◇</span>
            ) : (
              <span className="text-[12px] text-white/80">
                {TYPE_MARK[pub.type] ?? "·"}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          {TYPE_MARK[pub.type]} {PUBLICATION_LABELS[pub.type]}
        </span>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-white group-hover:text-omniv-gold">
          {pub.title}
        </p>
        <p className="truncate text-[12px] text-zinc-500">
          {name}
          {pub.meta ? ` · ${pub.meta}` : ""}
          {publisher?.location ? ` · ${publisher.location}` : ""}
        </p>
      </div>
      {isMusic ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-omniv-gold text-black">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      ) : (
        <span className="shrink-0 text-zinc-600 transition group-hover:text-zinc-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </Link>
  );
}

/** Standard card */
export function FeedCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = pub.publisherName || publisher?.name;

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      <div className="relative aspect-[16/10]">
        <CoverBg pub={pub} className="absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_55%)]" />
        <span className="absolute left-2.5 top-2.5">
          <TypeLabel type={pub.type} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[15px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
          {pub.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-zinc-400">
          {pub.summary}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-zinc-500">
          {name && <span className="truncate">{name}</span>}
          {pub.meta && (
            <>
              <span className="text-zinc-700">·</span>
              <span>{pub.meta}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
