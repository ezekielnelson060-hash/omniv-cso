"use client";

import Link from "next/link";
import { SaveButton } from "@/components/discovery/save-button";
import {
  PUBLICATION_LABELS,
  publicationPath,
  type Publication,
} from "@/lib/discovery/types";

type Pub = Publication & { coverUrl?: string };

const TONE: Record<string, string> = {
  article: "from-sky-700 to-slate-900",
  music: "from-fuchsia-700 to-purple-950",
  video: "from-rose-700 to-red-950",
  research: "from-emerald-700 to-teal-950",
  product: "from-amber-600 to-orange-950",
  event: "from-violet-700 to-indigo-950",
  announcement: "from-zinc-600 to-zinc-900",
  opportunity: "from-yellow-700 to-yellow-950",
  file: "from-cyan-700 to-slate-900",
};

/** Horizontal list row — Entity "Latest" as in mockup screen 6 */
export function EntityLatestRow({ pub }: { pub: Pub }) {
  const tone = TONE[pub.type] ?? "from-zinc-700 to-zinc-900";

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-2.5 pr-3 ring-1 ring-white/[0.08]">
      <Link
        href={publicationPath(pub)}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div
          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${tone}`}
          style={
            pub.coverUrl
              ? {
                  backgroundImage: `url(${pub.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!pub.coverUrl && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase text-white/80">
              {PUBLICATION_LABELS[pub.type]?.slice(0, 3)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            {PUBLICATION_LABELS[pub.type]}
          </span>
          <p className="truncate text-[14px] font-semibold text-white">
            {pub.title}
          </p>
          <p className="truncate text-[11px] text-zinc-500">
            {pub.meta || pub.publishedAt}
            {pub.type === "article" ? " · read" : ""}
          </p>
        </div>
      </Link>
      <SaveButton
        kind="publication"
        type={pub.type}
        slug={pub.slug}
        name={pub.title}
        pubType={pub.type}
        variant="icon"
      />
      <Link href={publicationPath(pub)} className="text-zinc-600">
        ›
      </Link>
    </div>
  );
}
