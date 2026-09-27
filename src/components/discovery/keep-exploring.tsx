import Link from "next/link";
import { SaveButton } from "@/components/discovery/save-button";
import { PublicationActions } from "@/components/discovery/publication-actions";
import type { DiscoveryEntity, Publication } from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";
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
  currentPublication?: PublicationWithMedia | null;
  currentEntity?: EntityWithMedia | null;
  entities?: EntityWithMedia[];
  publications?: PublicationWithMedia[];
  tags?: string[];
  title?: string;
}) {
  const exploreEntities = uniqueById(entities).slice(0, 6);
  const explorePublications = uniqueById(
    publications.filter((p) => p.id !== currentPublication?.id)
  ).slice(0, 6);
  const topicTags = (tags || []).slice(0, 8);

  if (
    !exploreEntities.length &&
    !explorePublications.length &&
    !topicTags.length
  ) {
    return null;
  }

  return (
    <section className="mt-14 space-y-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          {title}
        </p>
        <p className="mt-1 text-[13px] text-zinc-500">
          Related work and people on Omniv.
        </p>
      </div>

      {exploreEntities.length > 0 && (
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Entities</h3>
              <p className="mt-1 text-[13px] text-zinc-600">
                People, entities, and systems connected to this work.
              </p>
            </div>
            <span className="text-[11px] text-zinc-700">
              {exploreEntities.length} connections
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {exploreEntities.map((entity) => {
              const media =
                entity.imageUrl || entity.avatarUrl || coverFor(entity.slug);
              const tone = ENTITY_TONE[entity.type] || ENTITY_TONE.project;
              return (
                <div
                  key={entity.id}
                  className="group relative overflow-hidden rounded-2xl bg-[#0b0b0b] p-4 ring-1 ring-white/[0.08] transition hover:-translate-y-0.5 hover:ring-omniv-gold/35"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-20`}
                  />
                  <div className="relative flex items-start gap-3">
                    <Link
                      href={entityPath(entity)}
                      className="flex min-w-0 flex-1 gap-3"
                    >
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/40 text-[16px] font-semibold text-white ring-1 ring-white/15">
                        {media ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{entity.name.slice(0, 1)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-white group-hover:text-omniv-gold">
                          {entity.name}
                        </p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">
                          {ENTITY_LABELS[entity.type] || entity.type}
                        </p>
                        {entity.tagline && (
                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                            {entity.tagline}
                          </p>
                        )}
                      </div>
                    </Link>
                    <SaveButton
                      kind="entity"
                      type={entity.type}
                      slug={entity.slug}
                      name={entity.name}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {explorePublications.length > 0 && (
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-white">
                Publications
              </h3>
              <p className="mt-1 text-[13px] text-zinc-600">
                More to read, listen to, or act on.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {explorePublications.map((publication) => {
              const tone =
                PUBLICATION_TONE[publication.type] ||
                PUBLICATION_TONE.article;
              const cover =
                publication.coverUrl || coverFor(publication.slug);
              return (
                <div
                  key={publication.id}
                  className="group overflow-hidden rounded-2xl bg-[#0b0b0b] ring-1 ring-white/[0.08] transition hover:ring-omniv-gold/35"
                >
                  <div className="flex gap-4 p-3">
                    <Link
                      href={publicationPath(publication)}
                      className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl"
                    >
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${tone}`}
                        />
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
                        <p className="mt-2 text-[11px] text-zinc-600">
                          {publicationMeta(publication)}
                        </p>
                      </Link>
                      <div className="mt-2">
                        <PublicationActions
                          slug={publication.slug}
                          type={publication.type}
                          title={publication.title}
                          publishedAt={publication.publishedAt}
                          initialLikes={publication.heat ?? 0}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topicTags.length > 0 && (
        <div>
          <h3 className="text-[15px] font-semibold text-white">Topics</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {topicTags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition hover:border-omniv-gold/40 hover:text-omniv-gold"
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
