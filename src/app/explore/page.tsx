import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { PublicationCard } from "@/components/discovery/publication-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { RotatingSearch } from "@/components/discovery/rotating-search";
import { SearchSignal } from "@/components/discovery/search-signal";
import { FollowButton } from "@/components/discovery/follow-button";
import { listLivePublications, listDiscoveryEntities } from "@/lib/discovery/db";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { searchDiscovery } from "@/lib/discovery/search";
import { entityMedia } from "@/lib/discovery/entity-media";
import {
  ENTITY_LABELS,
  PUBLICATION_LABELS,
  PUBLICATION_TYPES,
  entityPath,
  publicationPath,
  type DiscoveryEntity,
  type Publication,
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
  const q = (sp.q || "").trim();
  const type = sp.type;
  const sort = sp.sort || "heat";
  const interest = (sp.interest || "").trim();

  const supabase = await tryClient();
  let publications = await listLivePublications(supabase, 120);
  let entities = await listDiscoveryEntities(supabase);
  if (publications.length < 6) {
    const { SEED_PUBLICATIONS } = await import("@/lib/discovery/seed");
    const slugs = new Set(publications.map((p) => p.slug));
    for (const s of SEED_PUBLICATIONS) {
      if (!slugs.has(s.slug)) publications.push(s);
    }
  }
  if (entities.length < 6) {
    const slugs = new Set(entities.map((e) => e.slug.toLowerCase()));
    const liveFirst = [...entities];
    for (const e of SEED_ENTITIES) {
      if (slugs.has(e.slug.toLowerCase())) continue;
      liveFirst.push(e);
      if (liveFirst.length >= 12) break;
    }
    entities = liveFirst;
  } else {
    entities = entities.slice(0, 48);
  }

  let filtered = publications;
  if (type && type !== "all" && (PUBLICATION_TYPES as readonly string[]).includes(type)) {
    filtered = filtered.filter((p) => p.type === type);
  }
  if (interest) {
    const needle = interest.toLowerCase();
    filtered = filtered.filter((p) => {
      const hay = [...(p.tags || []), p.category || "", p.title, p.summary]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }
  if (sort === "new") {
    filtered = [...filtered].sort((a, b) =>
      (b.publishedAt || "").localeCompare(a.publishedAt || "")
    );
  } else {
    filtered = [...filtered].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
  }

  const results = q ? searchDiscovery(q, filtered, entities, 30) : [];

  return (
    <ExploreShell q={q} type={type} interest={interest}>
      {q ? (
        <SearchResults results={results} query={q} />
      ) : (
        <DiscoverySections publications={filtered} entities={entities} typeFilter={type} />
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
        {results.length} for &ldquo;{query}&rdquo;
      </h2>
      <div className="mt-5 space-y-2">
        {results.map((result) =>
          result.kind === "publication" ? (
            <SearchPublication
              key={`publication-${result.item.id}`}
              publication={result.item}
            />
          ) : (
            <SearchEntity key={`entity-${result.item.id}`} entity={result.item} />
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
    <PublicationCard pub={publication} />
  );
}

function SearchEntity({ entity }: { entity: DiscoveryEntity }) {
  const { avatarUrl } = entityMedia(entity);
  return (
    <Link
      href={entityPath(entity)}
      className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-3 ring-1 ring-white/[0.07] transition hover:ring-white/15"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[14px] font-semibold text-omniv-gold">
            {entity.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white group-hover:text-omniv-gold">
          {entity.name}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          {ENTITY_LABELS[entity.type] || entity.type}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-400">
          {entity.tagline || entity.about?.slice(0, 90) || "On Omniv"}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-medium text-zinc-300 ring-1 ring-white/10">
        View
      </span>
    </Link>
  );
}

function EntityAvatar({
  entity,
  size = 56,
}: {
  entity: DiscoveryEntity;
  size?: number;
}) {
  const { avatarUrl } = entityMedia(entity);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[15px] font-semibold text-omniv-gold">
          {entity.name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function DiscoverySections({
  publications,
  entities,
  typeFilter,
}: {
  publications: Publication[];
  entities: DiscoveryEntity[];
  typeFilter?: string;
}) {
  const people = entities
    .filter((e) => e.type === "person" || e.type === "artist")
    .slice(0, 12);
  const publishers = entities
    .filter((e) =>
      ["company", "brand", "organization", "media", "project"].includes(e.type)
    )
    .slice(0, 10);
  const whoToFollow =
    people.length >= 4
      ? people
      : [...people, ...entities.filter((e) => !people.includes(e))].slice(0, 12);
  const topPublishers =
    publishers.length >= 3
      ? publishers
      : [...publishers, ...entities.filter((e) => !publishers.includes(e))].slice(
          0,
          8
        );

  const byType = (t: string) =>
    publications.filter((p) => p.type === t).slice(0, 8);

  const sections: { type: string; title: string }[] = [
    { type: "article", title: "Articles" },
    { type: "research", title: "Research" },
    { type: "music", title: "Music" },
    { type: "product", title: "Products" },
    { type: "opportunity", title: "Opportunities" },
    { type: "event", title: "Events" },
  ];

  // When a type chip is active, only show that type's cards (no empty other sections)
  const activeSections =
    typeFilter && typeFilter !== "all"
      ? sections.filter((s) => s.type === typeFilter)
      : sections;

  return (
    <div className="space-y-10">
      {/* Topics — kept from original Explore top */}
      <section>
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
          Topics
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Link
              key={t}
              href={`/explore?interest=${encodeURIComponent(t)}`}
              className="inline-flex h-8 items-center rounded-full bg-white/[0.06] px-3.5 text-[12px] font-medium text-zinc-300 hover:bg-white/[0.1] hover:text-white"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* Replaces old Entities list */}
      {whoToFollow.length > 0 ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-white">Who To Follow</h2>
            <Link
              href="/explore?interest=people"
              className="text-[13px] font-medium text-zinc-400 hover:text-omniv-gold"
            >
              View All
            </Link>
          </div>
          <div className="mt-3 -mx-1 flex gap-4 overflow-x-auto px-1 pb-1 scrollbar-none">
            {whoToFollow.map((e) => (
              <Link
                key={e.id}
                href={entityPath(e)}
                className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
              >
                <div className="relative">
                  <EntityAvatar entity={e} size={64} />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed] text-[12px] font-bold text-white ring-2 ring-[#050505]">
                    +
                  </span>
                </div>
                <p className="w-full truncate text-center text-[12px] font-medium text-zinc-200">
                  {e.name.split(" ")[0]}
                </p>
                <p className="w-full truncate text-center text-[10px] text-zinc-500">
                  @{e.slug.slice(0, 12)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {topPublishers.length > 0 ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-white">Top Publishers</h2>
            <span className="text-[12px] text-zinc-600">
              {entities.length} on Omniv
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {topPublishers.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-3 ring-1 ring-white/[0.07]"
              >
                <Link href={entityPath(e)} className="shrink-0">
                  <EntityAvatar entity={e} size={48} />
                </Link>
                <Link href={entityPath(e)} className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-white">
                    {e.name}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {ENTITY_LABELS[e.type] || e.type}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-400">
                    {e.tagline || e.about?.slice(0, 90) || "On Omniv"}
                  </p>
                </Link>
                <FollowButton
                  type={e.type}
                  slug={e.slug}
                  name={e.name}
                  id={e.id}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Type-aware publication cards (music ≠ article, etc.) */}
      {activeSections.map(({ type, title }) => {
        const items = byType(type);
        if (!items.length) return null;
        return (
          <section key={type}>
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
                {title}
              </h2>
              <Link
                href={`/explore?type=${type}`}
                className="text-[12px] font-medium text-omniv-gold"
              >
                See all
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {items.map((p) => (
                <PublicationCard key={p.id} pub={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ExploreShell({
  children,
  q,
  type,
  interest,
}: {
  children: ReactNode;
  q: string;
  type?: string;
  interest: string;
}) {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md"
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
          {q ? <SearchSignal query={q} /> : null}

          <h1 className="text-[26px] font-semibold tracking-tight text-white">
            Explore
          </h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Find what you are interested in.
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
              className="h-11 shrink-0 rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
            >
              Search
            </button>
          </form>

          <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TYPE_CHIPS.map((c) => {
              const active = (type || "all") === c.id;
              const href =
                c.id === "all"
                  ? interest
                    ? `/explore?interest=${encodeURIComponent(interest)}`
                    : "/explore"
                  : `/explore?type=${c.id}${
                      interest ? `&interest=${encodeURIComponent(interest)}` : ""
                    }`;
              return (
                <Link
                  key={c.id}
                  href={href}
                  className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[12px] font-medium ${
                    active
                      ? "bg-white text-black"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-6">{children}</div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
