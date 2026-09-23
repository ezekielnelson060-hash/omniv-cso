import Link from "next/link";
import { NetworkHeader } from "@/components/discovery/network-header";
import { EntityCard } from "@/components/discovery/entity-card";
import { SiteFooter } from "@/components/site-footer";
import {
  SEED_ENTITIES,
  listByIntent,
  newest,
  searchEntities,
  trending,
} from "@/lib/discovery/seed";
import {
  ENTITY_LABELS,
  ENTITY_TYPES,
  INTENT_LABELS,
  type EntityType,
  type IntentKind,
} from "@/lib/discovery/types";

type Props = {
  searchParams: Promise<{ q?: string; type?: string; intent?: string; sort?: string }>;
};

export const metadata = {
  title: "Explore",
  description:
    "Discover people, companies, brands, products, and opportunities on Omniv.",
};

function filterHref(base: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  Object.entries(next).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `/explore?${s}` : "/explore";
}

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type as EntityType | undefined;
  const intent = sp.intent as IntentKind | undefined;
  const sort = sp.sort ?? "trending";

  const base = {
    q: q || undefined,
    type: type || undefined,
    intent: intent || undefined,
    sort: sort !== "trending" ? sort : undefined,
  };

  let list = q ? searchEntities(q) : [...SEED_ENTITIES];

  if (type && ENTITY_TYPES.includes(type)) {
    list = list.filter((e) => e.type === type);
  }
  if (intent) {
    const withIntent = new Set(listByIntent(intent).map((e) => e.id));
    list = list.filter((e) => withIntent.has(e.id));
  }
  if (!q && !type && !intent) {
    list = sort === "new" ? newest(50) : trending(50);
  } else if (sort === "new") {
    list = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } else {
    list = [...list].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
  }

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <div className="mx-auto flex max-w-6xl gap-0 px-0 pb-16 md:gap-8 md:px-4 md:pt-6">
        {/* Sidebar filters — directory pattern */}
        <aside className="hidden w-56 shrink-0 border-r border-white/5 md:block md:border-0">
          <div className="sticky top-20 space-y-8 py-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Filter by
              </p>
              <Link
                href="/explore"
                className="mt-2 block text-[13px] text-zinc-500 hover:text-omniv-gold"
              >
                Clear filters
              </Link>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Type
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link
                    href={filterHref(base, { type: undefined })}
                    className={`block rounded-lg px-2 py-1.5 text-[13px] ${
                      !type ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    All
                  </Link>
                </li>
                {ENTITY_TYPES.map((t) => (
                  <li key={t}>
                    <Link
                      href={filterHref(base, { type: t })}
                      className={`block rounded-lg px-2 py-1.5 text-[13px] ${
                        type === t
                          ? "bg-white/10 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {ENTITY_LABELS[t]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Intent
              </p>
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                {(Object.keys(INTENT_LABELS) as IntentKind[]).map((k) => (
                  <li key={k}>
                    <Link
                      href={filterHref(base, { intent: k })}
                      className={`block rounded-lg px-2 py-1.5 text-[12px] leading-snug ${
                        intent === k
                          ? "bg-omniv-gold/15 text-omniv-gold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {INTENT_LABELS[k]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pt-6 md:px-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Browse the network
              </h1>
              <p className="mt-1 text-[13px] text-zinc-500">
                {list.length} listing{list.length === 1 ? "" : "s"}
                {q ? ` · “${q}”` : ""}
              </p>
            </div>
            <form action="/explore" method="get" className="flex gap-2">
              {type && <input type="hidden" name="type" value={type} />}
              {intent && <input type="hidden" name="intent" value={intent} />}
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search the network…"
                className="h-10 w-full min-w-[180px] rounded-full border border-white/15 bg-white/[0.04] px-4 text-[13px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/40 sm:w-56"
              />
              <select
                name="sort"
                defaultValue={sort}
                className="h-10 rounded-full border border-white/15 bg-[#0a0a0a] px-3 text-[12px] text-zinc-300"
              >
                <option value="trending">Trending</option>
                <option value="new">Newest</option>
              </select>
              <button
                type="submit"
                className="h-10 rounded-full bg-white px-4 text-[12px] font-medium text-black"
              >
                Search
              </button>
            </form>
          </div>

          {/* Mobile type chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            <Link
              href="/explore"
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] ${
                !type ? "bg-white text-black" : "border border-white/15 text-zinc-400"
              }`}
            >
              All
            </Link>
            {ENTITY_TYPES.map((t) => (
              <Link
                key={t}
                href={filterHref(base, { type: t })}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] ${
                  type === t
                    ? "bg-white text-black"
                    : "border border-white/15 text-zinc-400"
                }`}
              >
                {ENTITY_LABELS[t]}
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>

          {list.length === 0 && (
            <p className="mt-16 text-center text-[14px] text-zinc-500">
              Nothing matched.{" "}
              <Link href="/signup?from=publish" className="text-omniv-gold hover:underline">
                Publish something
              </Link>
            </p>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
