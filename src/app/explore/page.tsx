import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { SearchSignal } from "@/components/discovery/search-signal";
import { ExploreSearchBar } from "@/components/discovery/explore-search-bar";
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

function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  try {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return "";
    const diff = Date.now() - t;
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${Math.max(1, m)} min ago`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  } catch {
    return "";
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
      <h2 className="text-[17px] font-semibold text-white">
        {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
      </h2>
      <div className="mt-4 space-y-1">
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
      className="group block rounded-xl px-1 py-3 transition hover:bg-white/[0.04]"
    >
      <p className="text-[11px] font-medium text-zinc-500">
        {PUBLICATION_LABELS[publication.type] || publication.type}
      </p>
      <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-white group-hover:text-omniv-gold">
        {publication.title}
      </h3>
      {publication.summary ? (
        <p className="mt-0.5 line-clamp-2 text-[13px] text-zinc-500">
          {publication.summary}
        </p>
      ) : null}
    </Link>
  );
}

function SearchEntity({ entity }: { entity: DiscoveryEntity }) {
  const { avatarUrl } = entityMedia(entity);
  return (
    <Link
      href={entityPath(entity)}
      className="group flex items-center gap-3 rounded-xl px-1 py-3 transition hover:bg-white/[0.04]"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
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
        <p className="text-[12px] text-zinc-500">
          {ENTITY_LABELS[entity.type] || entity.type}
          {entity.tagline ? ` · ${entity.tagline}` : ""}
        </p>
      </div>
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
}: {
  publications: Publication[];
  entities: DiscoveryEntity[];
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

  const trending = publications.slice(0, 12);

  return (
    <div className="space-y-8">
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
            <Link
              href="/explore?type=all"
              className="text-[13px] font-medium text-zinc-400 hover:text-omniv-gold"
            >
              View All
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {topPublishers.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06]"
              >
                <Link href={entityPath(e)} className="shrink-0">
                  <EntityAvatar entity={e} size={48} />
                </Link>
                <Link href={entityPath(e)} className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-white">
                    {e.name}
                  </p>
                  <p className="truncate text-[12px] text-zinc-500">
                    {ENTITY_LABELS[e.type] || e.type}
                    {e.tagline ? ` · ${e.tagline}` : ""}
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

      {trending.length > 0 ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-white">Trending Now</h2>
            <Link
              href="/home"
              className="text-[13px] font-medium text-zinc-400 hover:text-omniv-gold"
            >
              View All
            </Link>
          </div>
          <div className="mt-3 divide-y divide-white/[0.06]">
            {trending.map((p) => {
              const ago = timeAgo(p.publishedAt);
              return (
                <Link
                  key={p.id}
                  href={publicationPath(p)}
                  className="group flex gap-3 py-3.5 first:pt-1"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-zinc-500">
                      {(p as { publisherName?: string }).publisherName ||
                        PUBLICATION_LABELS[p.type] ||
                        p.type}
                      {ago ? ` · ${ago}` : ""}
                    </p>
                    <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-white group-hover:text-omniv-gold">
                      {p.title}
                    </h3>
                    {p.summary ? (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
                        {p.summary}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
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
                className="rounded-md md:hidden"
              />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Explore
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

          <ExploreSearchBar value={q} type={type} interest={interest} />

          <div className="mt-6">{children}</div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
