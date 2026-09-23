import Link from "next/link";
import {
  PUBLICATION_LABELS,
  publicationPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";

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

export function PublicationCard({ pub }: { pub: Publication }) {
  const publisher = getEntityById(pub.publisherId);
  const cover = TONE[pub.type] ?? "from-zinc-600 to-zinc-900";

  return (
    <Link
      href={publicationPath(pub)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] transition hover:border-white/25"
    >
      <div
        className={`relative flex aspect-[16/9] items-end bg-gradient-to-br ${cover} p-3`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_55%)]" />
        <span className="relative rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/15">
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
            {publisher?.name ?? "Publisher"}
            {pub.meta ? ` · ${pub.meta}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
