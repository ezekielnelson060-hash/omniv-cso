import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { PublicationCard } from "@/components/discovery/publication-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
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

const TOPICS = ["World", "Technology", "Africa", "AI", "Music", "Research", "Business", "Culture"];
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
  description: "Discover publications, people, companies, research, music, products, and opportunities on Omniv.",
};

type Props = { searchParams: Promise<{ q?: string; type?: string; sort?: string; interest?: string }> };

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
  const type = PUBLICATION_TYPES.includes(sp.type as PublicationType) ? (sp.type as PublicationType) : undefined;
  const sort = sp.sort === "new" ? "new" : "trending";
  const interest = sp.interest?.trim() || "";
  const supabase = await tryClient();
  const publications = await listLivePublications(supabase, 80);
  const liveEntities = await listDiscoveryEntities(supabase);
  const entities = Array.from(new Map([...SEED_ENTITIES, ...liveEntities].map((entity) => [entity.id, entity])).values());

  let filtered = publications;
  if (type) filtered = filtered.filter((publication) => publication.type === type);
  if (interest) {
    const needle = interest.toLowerCase();
    filtered = filtered.filter((publication) =>
      [publication.title, publication.summary, publication.category || "", ...publication.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  filtered = [...filtered].sort((a, b) => sort === "new"
    ? (b.publishedAt || "").localeCompare(a.publishedAt || "")
    : (b.heat || 0) - (a.heat || 0));

  const results = q ? searchDiscovery(q, filtered, entities, 30) : [];
  return (
    <ExploreShell q={q} type={type} sort={sort} interest={interest}>
      {q ? <SearchResults results={results} query={q} /> : <DiscoverySections publications={filtered} entities={entities} />}
    </ExploreShell>
  );
}

function SearchResults({ results, query }: { results: ReturnType<typeof searchDiscovery>; query: string }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">Discovery results</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{results.length} paths for “{query}”</h2>
        </div>
        <Link href="/publish" className="hidden text-[12px] text-zinc-500 hover:text-white sm:block">Publish into this graph →</Link>
      </div>
      <div className="mt-8 space-y-3">
        {results.map((result) => result.kind === "publication"
          ? <SearchPublication key={`publication-${result.item.id}`} publication={result.item} />
          : <SearchEntity key={`entity-${result.item.id}`} entity={result.item} />)}
      </div>
      {results.length === 0 && <p className="mt-16 text-center text-[14px] text-zinc-500">Nothing matched yet. Try a person, place, topic, or publication.</p>}
    </section>
  );
}

function SearchPublication({ publication }: { publication: Publication }) {
  return (
    <Link href={publicationPath(publication)} className="group flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07] transition hover:bg-white/[0.06] hover:ring-omniv-gold/30">
      <div className="hidden h-16 w-24 shrink-0 rounded-xl bg-gradient-to-br from-omniv-gold/40 to-zinc-900 sm:block" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">Publication · {PUBLICATION_LABELS[publication.type]}</p>
        <h3 className="mt-1 truncate text-[16px] font-semibold text-white group-hover:text-omniv-gold">{publication.title}</h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-zinc-500">{publication.summary}</p>
      </div>
      <span className="text-zinc-600 group-hover:text-omniv-gold">→</span>
    </Link>
  );
}

function SearchEntity({ entity }: { entity: DiscoveryEntity }) {
  return (
    <Link href={entityPath(entity)} className="group flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07] transition hover:bg-white/[0.06] hover:ring-omniv-gold/30">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 text-lg font-semibold text-omniv-gold">{entity.name.slice(0, 1)}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">{ENTITY_LABELS[entity.type] || entity.type}</p>
        <h3 className="mt-1 truncate text-[16px] font-semibold text-white group-hover:text-omniv-gold">{entity.name}</h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-zinc-500">{entity.tagline}{entity.location ? ` · ${entity.location}` : ""}</p>
      </div>
      <span className="text-zinc-600 group-hover:text-omniv-gold">→</span>
    </Link>
  );
}

function DiscoverySections({ publications, entities }: { publications: Publication[]; entities: DiscoveryEntity[] }) {
  const people = entities.filter((entity) => entity.type === "person" || entity.type === "artist").slice(0, 4);
  const companies = entities.filter((entity) => entity.type === "company" || entity.type === "brand").slice(0, 4);
  const sections: { type: PublicationType; title: string }[] = [
    { type: "research", title: "Research" },
    { type: "music", title: "Music" },
    { type: "product", title: "Products" },
    { type: "event", title: "Events" },
    { type: "opportunity", title: "Opportunities" },
  ];
  return (
    <div className="space-y-14">
      <EditorialSection title="Trending now" action="/explore?sort=trending" publications={publications.slice(0, 6)} featured />
      <EditorialSection title="New on Omniv" action="/explore?sort=new" publications={[...publications].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")).slice(0, 4)} />
      <EntityRail title="People to discover" entities={people} />
      <EntityRail title="Companies to explore" entities={companies} />
      {sections.map((section) => (
        <EditorialSection key={section.type} title={section.title} action={`/explore?type=${section.type}`} publications={publications.filter((publication) => publication.type === section.type).slice(0, 4)} />
      ))}
    </div>
  );
}

function EditorialSection({ title, action, publications, featured = false }: { title: string; action: string; publications: Publication[]; featured?: boolean }) {
  if (!publications.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{title}</h2>
        <Link href={action} className="text-[12px] text-zinc-600 hover:text-omniv-gold">See all →</Link>
      </div>
      <div className={`grid gap-3 ${featured ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {publications.map((publication) => <PublicationCard key={publication.id} pub={publication} />)}
      </div>
    </section>
  );
}

function EntityRail({ title, entities }: { title: string; entities: DiscoveryEntity[] }) {
  if (!entities.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{title}</h2>
        <Link href={title.startsWith("People") ? "/explore?view=people" : "/explore?view=companies"} className="text-[12px] text-zinc-600 hover:text-omniv-gold">See all →</Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {entities.map((entity) => (
          <Link key={entity.id} href={entityPath(entity)} className="group rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07] transition hover:bg-white/[0.06] hover:ring-omniv-gold/30">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-omniv-gold/15 font-semibold text-omniv-gold">{entity.name.slice(0, 1)}</span>
              <div className="min-w-0"><p className="truncate text-[14px] font-semibold text-white group-hover:text-omniv-gold">{entity.name}</p><p className="text-[11px] text-zinc-500">{ENTITY_LABELS[entity.type] || entity.type}</p></div>
            </div>
            <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">{entity.tagline}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExploreShell({ children, q, type, sort, interest }: { children: ReactNode; q: string; type?: string; sort: string; interest: string }) {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6 lg:max-w-5xl"><div className="flex items-center gap-2"><Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md md:hidden" /><span className="text-[15px] font-semibold tracking-tight text-white">OMNIV</span></div><ProfileAvatarLink /></div></header>
        <main className="mx-auto max-w-lg px-4 pb-24 pt-12 md:max-w-2xl md:px-6 lg:max-w-5xl">
          <div className="max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">The discovery network</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">What are you looking for?</h1><p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-500">Find something worth following. Publications lead the way; people, companies, and ideas connect around them.</p></div>
          <form action="/explore" method="get" className="mt-8 flex gap-2"><RotatingSearch value={q} />{type && <input type="hidden" name="type" value={type} />}{interest && <input type="hidden" name="interest" value={interest} />}<button type="submit" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-omniv-gold text-black" aria-label="Search"><span className="text-xl">⌕</span></button></form>
          <div className="mt-5 flex flex-wrap gap-2">{TOPICS.map((topic) => <Link key={topic} href={`/explore?interest=${encodeURIComponent(topic)}`} className={`rounded-full px-3 py-1.5 text-[12px] ${interest.toLowerCase() === topic.toLowerCase() ? "bg-omniv-gold text-black" : "bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08] hover:text-white"}`}>{topic}</Link>)}</div>
          <div className="mt-8 flex gap-2 border-b border-white/[0.07] pb-3">{TYPE_CHIPS.map((chip) => <Link key={chip.id} href={chip.id === "all" ? "/explore" : `/explore?type=${chip.id}`} className={`text-[12px] ${(!type && chip.id === "all") || type === chip.id ? "font-semibold text-omniv-gold" : "text-zinc-600 hover:text-zinc-300"}`}>{chip.label}</Link>)}<span className="mx-1 text-zinc-800">/</span><Link href="/explore?sort=trending" className={`text-[12px] ${sort === "trending" ? "text-white" : "text-zinc-600"}`}>Trending</Link><Link href="/explore?sort=new" className={`text-[12px] ${sort === "new" ? "text-white" : "text-zinc-600"}`}>New</Link></div>
          <div className="mt-10">{children}</div>
        </main><BottomNav />
      </div>
    </DiscoveryShell>
  );
}
