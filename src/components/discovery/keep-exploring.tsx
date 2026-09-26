import Link from "next/link";
import type { DiscoveryEntity, Publication } from "@/lib/discovery/types";
import { entityPath, publicationPath, PUBLICATION_LABELS } from "@/lib/discovery/types";

export function KeepExploring({
  entities = [],
  publications = [],
  tags = [],
  title = "Keep exploring",
}: {
  entities?: DiscoveryEntity[];
  publications?: Publication[];
  tags?: string[];
  title?: string;
}) {
  if (!entities.length && !publications.length && !tags.length) return null;
  return (
    <section className="mt-14" aria-label={title}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">{title}</p>
      {entities.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {entities.slice(0, 8).map((entity) => (
            <Link
              key={entity.id}
              href={entityPath(entity)}
              className="group rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08] transition hover:bg-white/[0.06] hover:ring-omniv-gold/35"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-white group-hover:text-omniv-gold">{entity.name}</p>
                <span className="text-zinc-600 transition group-hover:text-omniv-gold">→</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">{entity.tagline}</p>
            </Link>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.slice(0, 10).map((tag) => (
            <Link
              key={tag}
              href={`/explore?q=${encodeURIComponent(tag)}`}
              className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-[12px] text-zinc-400 ring-1 ring-white/[0.08] transition hover:text-omniv-gold hover:ring-omniv-gold/30"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
      {publications.length > 0 && (
        <div className="mt-6 space-y-2">
          {publications.slice(0, 6).map((publication) => (
            <Link
              key={publication.id}
              href={publicationPath(publication)}
              className="group flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.06] transition hover:ring-white/20"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-white group-hover:text-omniv-gold">{publication.title}</p>
                <p className="mt-1 truncate text-[11px] text-zinc-500">
                  {PUBLICATION_LABELS[publication.type]}{publication.meta ? ` · ${publication.meta}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-zinc-600 group-hover:text-omniv-gold">→</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
