import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { PublicationCard } from "@/components/discovery/publication-card";
import { EntityCard } from "@/components/discovery/entity-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import {
  SEED_ENTITIES,
  SEED_PUBLICATIONS,
  newestPublications,
  searchEntities,
  searchPublications,
  trendingPublications,
} from "@/lib/discovery/seed";
import {
  EXPLORE_NAV,
  PUBLICATION_LABELS,
  PUBLICATION_TYPES,
  type PublicationType,
} from "@/lib/discovery/types";

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    publisher?: string;
  }>;
};

export const metadata = {
  title: "Explore",
  description: "Find what you're interested in on Omniv.",
};

const MOBILE_CHIPS: { id: string; label: string; href: string }[] = [
  { id: "all", label: "All", href: "/explore" },
  { id: "article", label: "Articles", href: "/explore?type=article" },
  { id: "music", label: "Music", href: "/explore?type=music" },
  { id: "video", label: "Videos", href: "/explore?type=video" },
  { id: "file", label: "Files", href: "/explore?type=file" },
  { id: "product", label: "Products", href: "/explore?type=product" },
  { id: "event", label: "Events", href: "/explore?type=event" },
  { id: "research", label: "Research", href: "/explore?type=research" },
];

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type as PublicationType | undefined;
  const sort = sp.sort ?? "trending";
  const publisherFilter = sp.publisher;

  if (publisherFilter) {
    let list = q ? searchEntities(q) : [...SEED_ENTITIES];
    list = list.filter((e) => e.type === publisherFilter);
    if (sort === "new") {
      list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    } else {
      list.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
    }

    return (
      <Shell q={q} type={type} sort={sort}>
        <p className="text-[13px] text-zinc-500">
          {list.length} publisher{list.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </div>
      </Shell>
    );
  }

  let list = q ? searchPublications(q) : [...SEED_PUBLICATIONS];
  if (type && PUBLICATION_TYPES.includes(type)) {
    list = list.filter((p) => p.type === type);
  }
  if (!q && !type) {
    list = sort === "new" ? newestPublications(50) : trendingPublications(50);
  } else if (sort === "new") {
    list = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } else {
    list = [...list].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
  }

  return (
    <Shell q={q} type={type} sort={sort}>
      <p className="text-[13px] text-zinc-500">
        {list.length} result{list.length === 1 ? "" : "s"}
        {q ? ` · “${q}”` : ""}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <PublicationCard key={p.id} pub={p} />
        ))}
      </div>
      {list.length === 0 && (
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
}: {
  children: ReactNode;
  q: string;
  type?: string;
  sort: string;
}) {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl lg:max-w-6xl">
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
              <p className="hidden text-[12px] text-zinc-500 sm:block">
                Find what you're interested in.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-omniv-gold/20 text-[12px] font-semibold text-omniv-gold ring-1 ring-omniv-gold/30"
            aria-label="Profile"
          >
            ·
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 pb-24 pt-4 lg:pb-16">
        <aside className="hidden w-44 shrink-0 lg:block">
          <div className="sticky top-20 space-y-1">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Explore
            </p>
            {EXPLORE_NAV.map((item) => {
              const active =
                (item.href === "/explore" &&
                  !type &&
                  !q &&
                  sort === "trending" &&
                  !item.href.includes("?")) ||
                (type && item.href.includes(`type=${type}`)) ||
                (sort === "new" && item.href.includes("sort=new")) ||
                (sort === "trending" &&
                  item.href.includes("sort=trending") &&
                  !type);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-2 py-1.5 text-[13px] ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="mx-auto min-w-0 flex-1 max-w-lg md:max-w-2xl lg:max-w-none">
          <form action="/explore" method="get" className="flex gap-2">
            {type && <input type="hidden" name="type" value={type} />}
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search anything…"
              className="h-11 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-4 text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/40"
            />
            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition hover:text-white"
              aria-label="Filter"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {MOBILE_CHIPS.map((c) => {
              const active =
                (c.id === "all" && !type) || (type && c.id === type);
              return (
                <Link
                  key={c.id}
                  href={c.href}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                    active
                      ? "bg-white text-black"
                      : "border border-white/15 text-zinc-400"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
