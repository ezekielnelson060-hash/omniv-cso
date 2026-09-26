import Link from "next/link";
import { SaveButton } from "@/components/discovery/save-button";
import type { DiscoveryEntity, Publication } from "@/lib/discovery/types";
import {
  ENTITY_LABELS,
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
} from "@/lib/discovery/types";

type EntityWithMedia = DiscoveryEntity & {
  imageUrl?: string;
  avatarUrl?: string;
};

type PublicationWithMedia = Publication & {
  coverUrl?: string;
  publisherName?: string;
};

const ENTITY_TONE: Record<string, string> = {
  person: "from-violet-600/80 to-indigo-950",
  artist: "from-fuchsia-600/70 to-purple-950",
  company: "from-sky-600/70 to-slate-950",
  brand: "from-rose-600/70 to-stone-950",
  project: "from-amber-600/70 to-orange-950",
};

const PUBLICATION_TONE: Record<string, string> = {
  article: "from-sky-700/80 via-slate-900 to-[#090909]",
  research: "from-emerald-700/70 via-teal-950 to-[#090909]",
  music: "from-fuchsia-700/70 via-purple-950 to-[#090909]",
  product: "from-amber-700/70 via-orange-950 to-[#090909]",
  opportunity: "from-omniv-gold/50 via-yellow-950 to-[#090909]",
};

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function publicationMeta(publication: PublicationWithMedia) {
  const type = PUBLICATION_LABELS[publication.type] || publication.type;
  const category = publication.category ? ` · ${publication.category}` : "";
  const reading = publication.readingTime
    ? ` · ${publication.readingTime} min read`
    : publication.meta
      ? ` · ${publication.meta}`
      : "";
  return `${type}${category}${reading}`;
}

export function KeepExploring({
  currentPublication,
  currentEntity,
  entities = [],
  publications = [],
  tags = [],
  title = "Keep exploring",
}: {
  currentPublication?: Publication;
  currentEntity?: DiscoveryEntity;
  entities?: EntityWithMedia[];
  publications?: PublicationWithMedia[];
  tags?: string[];
  title?: string;
}) {
  const exploreEntities = uniqueById(entities).slice(0, 8);
  const deeperPublications = uniqueById(publications).slice(0, 6);
  const topics = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, 8);

  if (!exploreEntities.length && !deeperPublications.length && !topics.length) return null;

  return (
    <section className="mt-16 border-t border-white/10 pt-10" aria-label={title}>
      <div className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">
          {title}
        </p>
        {currentPublication && (
          <div className="mt-3">
            <p className="text-[12px] uppercase tracking-[0.12em] text-zinc-600">You are reading</p>
            <p className="mt-1 text-[17px] font-medium leading-snug text-white">{currentPublication.title}</p>
          </div>
        )}
        {currentEntity && !currentPublication && (
          <div className="mt-3">
            <p className="text-[12px] uppercase tracking-[0.12em] text-zinc-600">Explore the network around</p>
            <p className="mt-1 text-[17px] font-medium leading-snug text-white">{currentEntity.name}</p>
          </div>
        )}
      </div>

      {exploreEntities.length > 0 && (
        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Explore</p>
              <p className="mt-1 text-[13px] text-zinc-600">People, entities, and systems connected to this work.</p>
            </div>
            <span className="text-[11px] text-zinc-700">{exploreEntities.length} connections</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {exploreEntities.map((entity) => {
              const media = entity.imageUrl || entity.avatarUrl;
              const tone = ENTITY_TONE[entity.type] || ENTITY_TONE.project;
              return (
                <div
                  key={entity.id}
                  className="group relative overflow-hidden rounded-2xl bg-[#0b0b0b] p-4 ring-1 ring-white/[0.08] transition hover:-translate-y-0.5 hover:ring-omniv-gold/35"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-20`} />
                  <div className="relative flex items-start gap-3">
                    <Link href={entityPath(entity)} className="flex min-w-0 flex-1 gap-3">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/40 text-[16px] font-semibold text-white ring-1 ring-white/15">
                        {media ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={media} alt="" className="h-full w-full object-cover" />
                        ) : (
                          entity.name.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-white group-hover:text-omniv-gold">
                          {entity.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                          {ENTITY_LABELS[entity.type]}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-400">
                          {entity.tagline}
                        </p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <SaveButton kind="entity" type={entity.type} slug={entity.slug} name={entity.name} variant="icon" />
                      <Link href={entityPath(entity)} className="text-[11px] font-medium text-omniv-gold">
                        Explore →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {deeperPublications.length > 0 && (
        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Go deeper</p>
          <p className="mt-1 text-[13px] text-zinc-600">Follow the thread into another publication.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {deeperPublications.map((publication) => {
              const tone = PUBLICATION_TONE[publication.type] || PUBLICATION_TONE.article;
              const publisher = publication.publisherName || "Omniv";
              return (
                <div
                  key={publication.id}
                  className="group overflow-hidden rounded-2xl bg-[#0b0b0b] ring-1 ring-white/[0.08] transition hover:ring-omniv-gold/35"
                >
                  <div className="flex gap-4 p-3">
                    <Link href={publicationPath(publication)} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                      {publication.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={publication.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${tone}`} />
                      )}
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                        {PUBLICATION_LABELS[publication.type]}
                      </span>
                    </Link>
                    <div className="min-w-0 flex-1 py-1">
                      <Link href={publicationPath(publication)}>
                        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-white group-hover:text-omniv-gold">
                          {publication.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                          {publication.summary}
                        </p>
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="truncate text-[11px] text-zinc-600">{publisher}{publicationMeta(publication).replace(PUBLICATION_LABELS[publication.type], "")}</p>
                        <div className="flex shrink-0 items-center gap-1">
                          <SaveButton kind="publication" type={publication.type} slug={publication.slug} name={publication.title} pubType={publication.type} variant="icon" />
                          <Link href={publicationPath(publication)} className="px-2 text-[11px] font-medium text-omniv-gold">Open →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topics.length > 0 && (
        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Explore topics</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((tag) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-zinc-400 ring-1 ring-white/[0.08] transition hover:text-omniv-gold hover:ring-omniv-gold/30"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
