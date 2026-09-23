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

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type as EntityType | undefined;
  const intent = sp.intent as IntentKind | undefined;
  const sort = sp.sort ?? "trending";

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
  } else if (sort === "trending") {
    list = [...list].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
  }

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Explore</h1>
        <p className="mt-1 text-[14px] text-zinc-500">
          Search the network. Filter by what something is — and what it needs.
        </p>

        <form action="/explore" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search…"
            className="h-11 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-4 text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/50"
          />
          <select
            name="type"
            defaultValue={type ?? ""}
            className="h-11 rounded-full border border-white/15 bg-[#0a0a0a] px-4 text-[13px] text-zinc-300 outline-none"
          >
            <option value="">All types</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTITY_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            name="intent"
            defaultValue={intent ?? ""}
            className="h-11 rounded-full border border-white/15 bg-[#0a0a0a] px-4 text-[13px] text-zinc-300 outline-none"
          >
            <option value="">Any intent</option>
            {(Object.keys(INTENT_LABELS) as IntentKind[]).map((k) => (
              <option key={k} value={k}>
                {INTENT_LABELS[k]}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-full border border-white/15 bg-[#0a0a0a] px-4 text-[13px] text-zinc-300 outline-none"
          >
            <option value="trending">Trending</option>
            <option value="new">New</option>
          </select>
          <button
            type="submit"
            className="h-11 rounded-full bg-white px-5 text-[13px] font-medium text-black"
          >
            Search
          </button>
        </form>

        <p className="mt-6 text-[12px] text-zinc-600">
          {list.length} result{list.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-10 text-center text-[14px] text-zinc-500">
            Nothing matched.{" "}
            <Link href="/signup?from=publish" className="text-omniv-gold hover:underline">
              Publish something
            </Link>
            .
          </p>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
