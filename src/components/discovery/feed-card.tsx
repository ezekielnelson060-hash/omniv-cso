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
    <article className="overflow-hidden rounded-2xl bg-[#0c0c0c]">
      <Link
        href={publicationPath(pub)}
        className="group block transition-opacity duration-200 hover:opacity-[0.97]"
      >
        <div className="relative aspect-[5/4] sm:aspect-[16/10]">
          <CoverBg pub={pub} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute left-4 top-4">
            <TypeLabel type={pub.type} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 pt-20">
            <h2 className="text-[22px] font-semibold leading-[1.2] tracking-tight text-white sm:text-[26px]">
              {pub.title}
            </h2>
            <div className="mt-2.5 flex items-center gap-2 text-[13px] text-zinc-400">
              {name && <span className="font-medium text-zinc-300">{name}</span>}
              {pub.meta && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span>{pub.meta}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
      {showExplore && tags.length > 0 && (
        <div className="border-t border-white/[0.04] px-5 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Explore
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/explore?q=${encodeURIComponent(t)}`}
                className="text-[12px] text-zinc-400 transition hover:text-omniv-gold"
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
  const isEvent = pub.type === "event";
  const datePart = isEvent && pub.meta ? pub.meta.split("·")[0]?.trim() : null;

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex items-center gap-3.5 rounded-2xl bg-[#0c0c0c] p-2.5 transition-colors duration-200 hover:bg-[#101010]"
    >
      {isEvent && datePart ? (
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.04]">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
            Event
          </span>
          <span className="mt-0.5 text-center text-[11px] font-semibold leading-tight text-white">
            {datePart.slice(0, 12)}
          </span>
        </div>
      ) : (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <CoverBg pub={pub} className="absolute inset-0" />
          {isMusic && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
          {PUBLICATION_LABELS[pub.type]}
        </span>
        <p className="mt-0.5 truncate text-[15px] font-semibold tracking-tight text-white group-hover:text-omniv-gold">
          {pub.title}
        </p>
        <p className="truncate text-[12px] text-zinc-500">
          {name}
          {pub.meta ? ` · ${pub.meta}` : ""}
        </p>
      </div>
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
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] transition-colors duration-200 hover:bg-[#101010]"
    >
      <div className="relative aspect-[16/10]">
        <CoverBg pub={pub} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute left-3 top-3">
          <TypeLabel type={pub.type} />
        </span>
      </div>
      <div className="flex flex-1 flex-col px-4 py-3.5">
        <p className="text-[16px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
          {pub.title}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
          {pub.summary}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-zinc-600">
          {name && <span className="truncate text-zinc-500">{name}</span>}
          {pub.meta && (
            <>
              <span>·</span>
              <span>{pub.meta}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
