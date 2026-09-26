import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { PublicationCard } from "@/components/discovery/publication-card";
import { EntityCard } from "@/components/discovery/entity-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { listLivePublications, listDiscoveryEntities } from "@/lib/discovery/db";
import {
  SEED_ENTITIES,
  searchEntities,
  searchPublications,
} from "@/lib/discovery/seed";
import {
  PUBLICATION_TYPES,
  type Publication,
  type PublicationType,
} from "@/lib/discovery/types";

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    publisher?: string;
    interest?: string;
    view?: string;
  }>;
};

export const metadata = {
  title: "Explore",
  description: "What are you looking for? Search publications, people, and more on Omniv.",
};

const TYPE_CHIPS: { id: string; label: string; href: string }[] = [
  { id: "all", label: "All", href: "/explore" },
  { id: "article", label: "Articles", href: "/explore?type=article" },
  { id: "music", label: "Music", href: "/explore?type=music" },
  { id: "video", label: "Videos", href: "/explore?type=video" },
  { id: "research", label: "Research", href: "/explore?type=research" },
  { id: "product", label: "Products", href: "/explore?type=product" },
  { id: "event", label: "Events", href: "/explore?type=event" },
  { id: "opportunity", label: "Opportunities", href: "/explore?type=opportunity" },
];

const TOPICS = [
  "World",
  "Technology",
  "Africa",
  "AI",
  "Music",
  "Research",
  "Business",
  "Culture",
  "People",
];

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
  const q = sp.q?.trim() ?? "";
  const type = sp.type as PublicationType | undefined;
  const sort = sp.sort ?? "trending";
  const publisherFilter = sp.publisher;
  const interest = sp.interest?.trim() ?? "";
  const view = sp.view; // people | companies

  const supabase = await tryClient();

  // People / companies view
  if (publisherFilter || view === "people" || view === "companies") {
    const liveEntities = await listDiscoveryEntities(supabase);
    let list = q ? searchEntities(q) : [...liveEntities];
    if (list.length === 0) list = q ? searchEntities(q) : [...SEED_ENTITIES];

    if (publisherFilter) {
      list = list.filter((e) => e.type === publisherFilter);
    } else if (view === "people") {
      list = list.filter((e) => e.type === "person" || e.type === "artist");
    } else if (view === "companies") {
      list = list.filter(
        (e) =>
          e.type === "company" ||
          e.type === "brand" ||
          e.type === "product"
      );
    }

    if (sort === "new") {
      list.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
    } else {
      list.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
    }

    return (
      <Shell q={q} type={type} sort={sort} interest={interest} view={view}>
        <p className="text-[13px] text-zinc-500">
          {list.length} result{list.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </div>
      </Shell>
    );
  }

  const mixed = await listLivePublications(supabase, 60);

  let list: Publication[] = q
    ? searchPublications(q)
    : mixed.length
      ? mixed
      : [...mixed];

  if (q) {
    const liveHits = mixed.filter(
      (p) =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.summary.toLowerCase().includes(q.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
    );
    const slugs = new Set(liveHits.map((p) => p.slug));
    for (const s of list) {
      if (!slugs.has(s.slug)) liveHits.push(s);
    }
    list = liveHits;
  }

  if (type && PUBLICATION_TYPES.includes(type)) {
    list = list.filter((p) => p.type === type);
  }

  if (interest) {
    const needle = interest.toLowerCase();
    list = list.filter(
      (p) =>
        p.tags.some((t) => t.toLowerCase().includes(needle)) ||
        p.title.toLowerCase().includes(needle) ||
        p.summary.toLowerCase().includes(needle)
    );
  }

  if (sort === "new") {
    list = [...list].sort((a, b) =>
      (b.publishedAt || "").localeCompare(a.publishedAt || "")
    );
  } else {
    list = [...list].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
  }

  // When searching, also surface matching people
  const peopleHits = q ? searchEntities(q).slice(0, 4) : [];

  return (
    <Shell q={q} type={type} sort={sort} interest={interest} view={view}>
      {peopleHits.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            People & organizations
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {peopleHits.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>
        </div>
      )}

      <p className="text-[13px] text-zinc-500">
        {list.length} publication{list.length === 1 ? "" : "s"}
        {q ? ` · “${q}”` : ""}
        {interest ? ` · ${interest}` : ""}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <PublicationCard key={p.id} pub={p} />
        ))}
      </div>
      {list.length === 0 && peopleHits.length === 0 && (
        <p className="mt-16 text-center text-[14px] text-zinc-500">
          Nothing matched.{" "}
          <Link href="/publish" className="text-omniv-gold hover:underline">
            Publish something
          </Link>
        </p>
      )}
    </Shell>
  );
}

function Shell({
  children,
  q,
  type,
  sort,
  interest,
  view,
}: {
  children: ReactNode;
  q: string;
  type?: string;
  sort: string;
  interest: string;
  view?: string;
}) {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6 lg:max-w-4xl">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md md:hidden"
              />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                  Explore
                </h1>
              </div>
            </div>
            <ProfileAvatarLink />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-24 pt-4 md:max-w-2xl md:px-6 lg:max-w-4xl">
          <p className="mb-3 text-[15px] text-zinc-400">
            What are you looking for?
          </p>

          <form action="/explore" method="get" className="flex gap-2">
            {type && <input type="hidden" name="type" value={type} />}
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search publications, people, topics…"
              className="h-12 flex-1 rounded-full bg-white/[0.05] px-5 text-[15px] text-white outline-none ring-1 ring-white/[0.1] placeholder:text-zinc-600 focus:ring-omniv-gold/40"
            />
            <button
              type="submit"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold text-black"
              aria-label="Search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TYPE_CHIPS.map((c) => {
              const active =
                (c.id === "all" && !type && !view) || (type && c.id === type);
              return (
                <Link
                  key={c.id}
                  href={c.href}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                    active
                      ? "bg-omniv-gold text-black"
                      : "text-zinc-400 ring-1 ring-white/12 hover:text-white"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
            <Link
              href="/explore?view=people"
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                view === "people"
                  ? "bg-omniv-gold text-black"
                  : "text-zinc-400 ring-1 ring-white/12 hover:text-white"
              }`}
            >
              People
            </Link>
            <Link
              href="/explore?view=companies"
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                view === "companies"
                  ? "bg-omniv-gold text-black"
                  : "text-zinc-400 ring-1 ring-white/12 hover:text-white"
              }`}
            >
              Companies
            </Link>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Topics
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((name) => {
                const active = interest.toLowerCase() === name.toLowerCase();
                return (
                  <Link
                    key={name}
                    href={
                      active
                        ? "/explore"
                        : `/explore?interest=${encodeURIComponent(name)}`
                    }
                    className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                      active
                        ? "bg-omniv-gold text-black"
                        : "text-zinc-400 ring-1 ring-white/12 hover:text-white"
                    }`}
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={
                type
                  ? `/explore?type=${type}&sort=trending`
                  : "/explore?sort=trending"
              }
              className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                sort !== "new"
                  ? "bg-white/10 text-white"
                  : "text-zinc-500"
              }`}
            >
              Trending
            </Link>
            <Link
              href={type ? `/explore?type=${type}&sort=new` : "/explore?sort=new"}
              className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                sort === "new"
                  ? "bg-white/10 text-white"
                  : "text-zinc-500"
              }`}
            >
              New
            </Link>
          </div>

          <div className="mt-6">{children}</div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
