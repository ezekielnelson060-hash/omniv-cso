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
  article: "from-sky-600/70 to-slate-900",
  music: "from-fuchsia-500/70 to-purple-950",
  video: "from-rose-500/70 to-red-950",
  research: "from-emerald-500/60 to-teal-950",
  product: "from-amber-500/60 to-orange-950",
  event: "from-violet-500/60 to-indigo-950",
  announcement: "from-zinc-500/50 to-zinc-900",
  opportunity: "from-omniv-gold/40 to-yellow-950",
  file: "from-cyan-600/50 to-slate-900",
};

export function PublicationCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = pub.publisherName || publisher?.name || "Publisher";
  const cover = TONE[pub.type] ?? "from-zinc-600 to-zinc-900";
  const isMusic = pub.type === "music";
  const isEvent = pub.type === "event";
  const isOpp = pub.type === "opportunity";

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      <div className="relative flex aspect-[16/9] items-end overflow-hidden p-3">
        {pub.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pub.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${cover}`} />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_55%)]" />
        {isMusic && (
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
        {isEvent && pub.meta && (
          <span className="absolute right-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-center text-[10px] font-semibold leading-tight text-white">
            {pub.meta.split(" · ")[0]}
          </span>
        )}
        {isOpp && (
          <span className="absolute right-3 top-3 rounded-full bg-omniv-gold/90 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
            Open
          </span>
        )}
        <span className="relative rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
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
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="truncate text-[12px] text-zinc-500">
            {name}
            {pub.meta ? ` · ${pub.meta}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
