import Link from "next/link";
import {
  PUBLICATION_LABELS,
  publicationPath,
  type Publication,
} from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";

type Item = Pick<
  Publication,
  "slug" | "type" | "title" | "summary" | "publisherName" | "publisherSlug"
> & {
  coverUrl?: string | null;
  mediaUrl?: string | null;
  publishedAt?: string | null;
};

const TONE: Record<string, string> = {
  music: "from-fuchsia-700/80 to-purple-950",
  video: "from-rose-700/70 to-red-950",
  article: "from-sky-700/70 to-slate-950",
  research: "from-emerald-700/70 to-teal-950",
  file: "from-amber-700/70 to-orange-950",
  product: "from-yellow-700/60 to-stone-950",
  opportunity: "from-omniv-gold/40 to-yellow-950",
  event: "from-indigo-700/70 to-violet-950",
};

function isMedia(type: string) {
  return type === "music" || type === "video";
}

function isDoc(type: string) {
  return type === "file" || type === "research";
}

/** 2–3 other works from the same publisher, type-aware layout. */
export function MoreFromPublisher({
  publisherName,
  items,
  profileHref,
}: {
  publisherName: string;
  items: Item[];
  profileHref?: string | null;
}) {
  const list = items.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            More from {publisherName}
          </p>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            Other releases and work from this publisher
          </p>
        </div>
        {profileHref ? (
          <Link
            href={profileHref}
            className="shrink-0 text-[12px] font-medium text-omniv-gold hover:underline"
          >
            Full profile →
          </Link>
        ) : null}
      </div>

      <div className="space-y-2.5">
        {list.map((item) => {
          const href = publicationPath({
            slug: item.slug,
            type: item.type,
            publisherName: item.publisherName || publisherName,
            publisherSlug: item.publisherSlug,
          });
          const cover = item.coverUrl || coverFor(item.slug);
          const tone = TONE[item.type] || TONE.article;
          const label =
            PUBLICATION_LABELS[item.type as keyof typeof PUBLICATION_LABELS] ||
            item.type;

          if (isMedia(item.type)) {
            return (
              <Link
                key={item.slug}
                href={href}
                className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.07] transition hover:ring-omniv-gold/30"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${tone}`} />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                    {item.type === "music" ? "♪" : "▶"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">
                    {label}
                    {item.type === "music" ? " · Listen" : " · Watch"}
                  </p>
                </div>
              </Link>
            );
          }

          if (isDoc(item.type)) {
            return (
              <Link
                key={item.slug}
                href={href}
                className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.07] transition hover:ring-omniv-gold/30"
              >
                <div
                  className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white`}
                >
                  <span className="text-[10px] font-bold uppercase">PDF</span>
                  <span className="text-[18px] leading-none">📄</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14px] font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">
                    {label} · Document
                  </p>
                </div>
              </Link>
            );
          }

          // Article / default — horizontal card with wider cover
          return (
            <Link
              key={item.slug}
              href={href}
              className="flex gap-3 overflow-hidden rounded-2xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.07] transition hover:ring-omniv-gold/30"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${tone}`} />
                )}
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                  {label}
                </span>
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-white">
                  {item.title}
                </p>
                {item.summary ? (
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-500">
                    {item.summary.startsWith("{") ? "" : item.summary}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
