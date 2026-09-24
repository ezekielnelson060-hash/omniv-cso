import Link from "next/link";
import {
  PUBLICATION_LABELS,
  publicationPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";

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

/** Large hero — articles / research / video */
export function FeedFeaturedCard({ pub }: { pub: Publication }) {
  const publisher = getEntityById(pub.publisherId);
  const cover = TONE[pub.type] ?? "from-zinc-700 to-black";

  return (
    <Link
      href={publicationPath(pub)}
      className="group block overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${cover} sm:aspect-[16/10]`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {PUBLICATION_LABELS[pub.type]}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-16">
          <h2 className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
            {pub.title}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-[13px] text-zinc-300">
            {publisher && (
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-omniv-gold/20 text-[9px] font-bold text-omniv-gold">
                  {publisher.name.charAt(0)}
                </span>
                {publisher.name}
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
  );
}

/** Compact — music (play), product, opportunity */
export function FeedCompactCard({ pub }: { pub: Publication }) {
  const publisher = getEntityById(pub.publisherId);
  const cover = TONE[pub.type] ?? "from-zinc-700 to-black";
  const isMusic = pub.type === "music";
  const isProduct = pub.type === "product";

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-[#0c0c0c] p-2.5 ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      <div
        className={`relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${cover}`}
      >
        {isMusic ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        ) : isProduct ? (
          <span className="text-2xl text-omniv-gold/90">◎</span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
            {PUBLICATION_LABELS[pub.type].slice(0, 3)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          {PUBLICATION_LABELS[pub.type]}
        </span>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-white group-hover:text-omniv-gold">
          {pub.title}
        </p>
        <p className="truncate text-[12px] text-zinc-500">
          {publisher?.name}
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
export function FeedCard({ pub }: { pub: Publication }) {
  const publisher = getEntityById(pub.publisherId);
  const cover = TONE[pub.type] ?? "from-zinc-700 to-black";

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${cover}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_55%)]" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
          {PUBLICATION_LABELS[pub.type]}
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
          {publisher && <span className="truncate">{publisher.name}</span>}
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
