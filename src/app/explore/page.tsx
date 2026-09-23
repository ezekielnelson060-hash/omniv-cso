import Link from "next/link";
import type { ReactNode } from "react";
import { NetworkHeader } from "@/components/discovery/network-header";
import { PublicationCard } from "@/components/discovery/publication-card";
import { EntityCard } from "@/components/discovery/entity-card";
import { SiteFooter } from "@/components/site-footer";
import {
  SEED_ENTITIES,
  SEED_PUBLICATIONS,
  newestPublications,
  searchEntities,
  searchPublications,
  trending,
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
  description: "Discover publications and publishers on Omniv.",
};

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
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        {list.length} publication{list.length === 1 ? "" : "s"}
        {q ? ` · “${q}”` : ""}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
      <NetworkHeader />
      <div className="mx-auto flex max-w-6xl gap-8 px-4 pb-16 pt-6">
        <aside className="hidden w-44 shrink-0 md:block">
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

        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Explore
              </h1>
              <p className="mt-1 text-[13px] text-zinc-500">
                What publishers are putting into the world.
              </p>
            </div>
            <form action="/explore" method="get" className="flex gap-2">
              {type && <input type="hidden" name="type" value={type} />}
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search…"
                className="h-10 w-full min-w-[160px] rounded-full border border-white/15 bg-white/[0.04] px-4 text-[13px] text-white outline-none placeholder:text-zinc-600 sm:w-52"
              />
              <button
                type="submit"
                className="h-10 rounded-full bg-white px-4 text-[12px] font-medium text-black"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {PUBLICATION_TYPES.map((t) => (
              <Link
                key={t}
                href={`/explore?type=${t}`}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] ${
                  type === t
                    ? "bg-white text-black"
                    : "border border-white/15 text-zinc-400"
                }`}
              >
                {PUBLICATION_LABELS[t]}
              </Link>
            ))}
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
