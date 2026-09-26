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

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] transition-colors duration-200 hover:bg-[#101010]"
    >
      <div className="relative flex aspect-[16/10] items-end overflow-hidden p-3">
        {pub.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pub.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${cover}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {isMusic && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
        {isEvent && pub.meta && (
          <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-medium text-white/90">
            {pub.meta.split(" · ")[0]}
          </span>
        )}
        {isOpp && (
          <span className="absolute right-3 top-3 text-[10px] font-semibold uppercase tracking-wide text-omniv-gold">
            Open
          </span>
        )}
        <span className="relative text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85">
          {PUBLICATION_LABELS[pub.type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3.5 py-3">
        <p className="text-[15px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
          {pub.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
          {pub.summary}
        </p>
        <p className="mt-auto truncate pt-2.5 text-[12px] text-zinc-600">
          {name}
          {pub.meta ? ` · ${pub.meta}` : ""}
        </p>
      </div>
    </Link>
  );
}
