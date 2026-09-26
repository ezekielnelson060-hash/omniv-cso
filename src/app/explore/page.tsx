import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { PublicationCard } from "@/components/discovery/publication-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { RotatingSearch } from "@/components/discovery/rotating-search";
import { listLivePublications, listDiscoveryEntities } from "@/lib/discovery/db";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { searchDiscovery } from "@/lib/discovery/search";
import {
  ENTITY_LABELS,
  PUBLICATION_LABELS,
  PUBLICATION_TYPES,
  entityPath,
  publicationPath,
  type DiscoveryEntity,
  type Publication,
  type PublicationType,
} from "@/lib/discovery/types";

const TOPICS = [
  "World",
  "Technology",
  "Africa",
  "AI",
  "Music",
  "Research",
  "Business",
  "Culture",
];
const TYPE_CHIPS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "research", label: "Research" },
  { id: "music", label: "Music" },
  { id: "product", label: "Products" },
  { id: "event", label: "Events" },
  { id: "opportunity", label: "Opportunities" },
];

export const metadata = {
  title: "Explore | Omniv",
  description:
    "Discover publications, people, companies, research, music, products, and opportunities on Omniv.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    interest?: string;
  }>;
};

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const type = PUBLICATION_TYPES.includes(sp.type as PublicationType)
    ? (sp.type as PublicationType)
    : undefined;
  const sort = sp.sort === "new" ? "new" : "trending";
  const interest = sp.interest?.trim() || "";
  const supabase = await tryClient();
  const publications = await listLivePublications(supabase, 80);
  const liveEntities = await listDiscoveryEntities(supabase);
  const entities = Array.from(
    new Map(
      [...SEED_ENTITIES, ...liveEntities].map((entity) => [entity.id, entity])
    ).values()
  );

  let filtered = publications;
  if (type)
    filtered = filtered.filter((publication) => publication.type === type);
  if (interest) {
    const needle = interest.toLowerCase();
    filtered = filtered.filter((publication) =>
      [
        publication.title,
        publication.summary,
        publication.category || "",
        ...publication.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  filtered = [...filtered].sort((a, b) =>
    sort === "new"
      ? (b.publishedAt || "").localeCompare(a.publishedAt || "")
      : (b.heat || 0) - (a.heat || 0)
  );

  const results = q ? searchDiscovery(q, filtered, entities, 30) : [];
  return (
    <ExploreShell q={q} type={type} sort={sort} interest={interest}>
      {q ? (
        <SearchResults results={results} query={q} />
      ) : (
        <DiscoverySections publications={filtered} entities={entities} />
      )}
    </ExploreShell>
  );
}

function SearchResults({
  results,
  query,
}: {
  results: ReturnType<typeof searchDiscovery>;
  query: string;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white">
        {results.length} for “{query}”
      </h2>
      <div className="mt-5 space-y-2">
        {results.map((result) =>
          result.kind === "publication" ? (
            <SearchPublication
              key={`publication-${result.item.id}`}
              publication={result.item}
            />
          ) : (
            <SearchEntity
              key={`entity-${result.item.id}`}
              entity={result.item}
            />
          )
        )}
      </div>
      {results.length === 0 && (
        <p className="mt-12 text-center text-[14px] text-zinc-500">
          Nothing matched yet.
        </p>
      )}
    </section>
  );
}

function SearchPublication({ publication }: { publication: Publication }) {
  return (
    <Link
      href={publicationPath(publication)}
      className="group block rounded-xl bg-white/[0.03] px-3.5 py-3 transition hover:bg-white/[0.06]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-omniv-gold">
        {PUBLICATION_LABELS[publication.type]}
      </p>
      <h3 className="mt-0.5 text-[15px] font-semibold text-white group-hover:text-omniv-gold">
        {publication.title}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500">
        {publication.summary}
      </p>
    </Link>
  );
}

function SearchEntity({ entity }: { entity: DiscoveryEntity }) {
  return (
    <Link
      href={entityPath(entity)}
      className="group flex items-center gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 transition hover:bg-white/[0.06]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 font-semibold text-omniv-gold">
        {entity.name.slice(0, 1)}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-white group-hover:text-omniv-gold">
          {entity.name}
        </h3>
        <p className="truncate text-[12px] text-zinc-500">
          {ENTITY_LABELS[entity.type] || entity.type}
          {entity.location ? ` · ${entity.location}` : ""}
        </p>
      </div>
    </Link>
  );
}

function DiscoverySections({
  publications,
  entities,
}: {
  publications: Publication[];
  entities: DiscoveryEntity[];
}) {
  const people = entities
    .filter((entity) => entity.type === "person" || entity.type === "artist")
    .slice(0, 4);
  const companies = entities
    .filter((entity) => entity.type === "company" || entity.type === "brand")
    .slice(0, 4);
  const sections: { type: PublicationType; title: string }[] = [
    { type: "research", title: "Research" },
    { type: "music", title: "Music" },
    { type: "product", title: "Products" },
    { type: "event", title: "Events" },
    { type: "opportunity", title: "Opportunities" },
  ];
  return (
    <div className="space-y-10">
      <EditorialSection
        title="Trending now"
        action="/explore?sort=trending"
        publications={publications.slice(0, 6)}
        featured
      />
      <EditorialSection
        title="New on Omniv"
        action="/explore?sort=new"
        publications={[...publications]
          .sort((a, b) =>
            (b.publishedAt || "").localeCompare(a.publishedAt || "")
          )
          .slice(0, 4)}
      />
      <EntityRail title="People to discover" entities={people} />
      <EntityRail title="Companies to explore" entities={companies} />
      {sections.map((section) => (
        <EditorialSection
          key={section.type}
          title={section.title}
          action={`/explore?type=${section.type}`}
          publications={publications
            .filter((publication) => publication.type === section.type)
            .slice(0, 4)}
        />
      ))}
    </div>
  );
}

function EditorialSection({
  title,
  action,
  publications,
  featured = false,
}: {
  title: string;
  action: string;
  publications: Publication[];
  featured?: boolean;
}) {
  if (!publications.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {title}
        </h2>
        <Link
          href={action}
          className="text-[12px] text-zinc-600 hover:text-omniv-gold"
        >
          See all →
        </Link>
      </div>
      <div
        className={`grid gap-3 ${featured ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}
      >
        {publications.map((publication) => (
          <PublicationCard key={publication.id} pub={publication} />
        ))}
      </div>
    </section>
  );
}

function EntityRail({
  title,
  entities,
}: {
  title: string;
  entities: DiscoveryEntity[];
}) {
  if (!entities.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {title}
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {entities.map((entity) => (
          <Link
            key={entity.id}
            href={entityPath(entity)}
            className="group flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06] transition hover:bg-white/[0.06]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 text-[14px] font-semibold text-omniv-gold">
              {entity.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-white group-hover:text-omniv-gold">
                {entity.name}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {ENTITY_LABELS[entity.type] || entity.type}
                {entity.location ? ` · ${entity.location}` : ""}
              </p>
            </div>
            <span className="text-zinc-600">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExploreShell({
  children,
  q,
  type,
  sort,
  interest,
}: {
  children: ReactNode;
  q: string;
  type?: string;
  sort: string;
  interest: string;
}) {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md md:hidden"
              />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                OMNIV
              </span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <h1 className="text-[26px] font-semibold tracking-tight text-white">
            Explore
          </h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Find what you&apos;re interested in.
          </p>

          <form action="/explore" method="get" className="mt-4 flex gap-2">
            <div className="min-w-0 flex-1">
              <RotatingSearch value={q} />
            </div>
            {type && <input type="hidden" name="type" value={type} />}
            {interest && (
              <input type="hidden" name="interest" value={interest} />
            )}
            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white ring-1 ring-white/10 transition hover:bg-white/[0.12]"
              aria-label="Filter"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          <div className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none">
            {TYPE_CHIPS.map((chip) => (
              <Link
                key={chip.id}
                href={chip.id === "all" ? "/explore" : `/explore?type=${chip.id}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  (!type && chip.id === "all") || type === chip.id
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                {chip.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none">
            {TOPICS.map((topic) => (
              <Link
                key={topic}
                href={`/explore?interest=${encodeURIComponent(topic)}`}
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${
                  interest.toLowerCase() === topic.toLowerCase()
                    ? "bg-white/15 text-white"
                    : "bg-transparent text-zinc-600 ring-1 ring-white/10 hover:text-zinc-400"
                }`}
              >
                {topic}
              </Link>
            ))}
            <Link
              href="/explore?sort=trending"
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${
                sort === "trending" && !interest
                  ? "bg-white/15 text-white"
                  : "text-zinc-600 ring-1 ring-white/10"
              }`}
            >
              Trending
            </Link>
            <Link
              href="/explore?sort=new"
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${
                sort === "new" && !interest
                  ? "bg-white/15 text-white"
                  : "text-zinc-600 ring-1 ring-white/10"
              }`}
            >
              New
            </Link>
          </div>

          <div className="mt-5">{children}</div>
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
