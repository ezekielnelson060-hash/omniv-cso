import Link from "next/link";
import { NetworkHeader } from "@/components/discovery/network-header";
import { PublicationCard } from "@/components/discovery/publication-card";
import { SiteFooter } from "@/components/site-footer";
import { listLivePublications } from "@/lib/discovery/db";
import {
  newestPublications,
  trendingPublications,
} from "@/lib/discovery/seed";
import {
  EXPLORE_NAV,
  PUBLICATION_LABELS,
  PUBLICATION_TYPES,
  type Publication,
} from "@/lib/discovery/types";

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export default async function DiscoveryHomePage() {
  const supabase = await tryClient();
  const live = await listLivePublications(supabase, 24);

  let trend: Publication[] = [...live].sort(
    (a, b) => (b.heat ?? 0) - (a.heat ?? 0)
  );
  if (trend.length < 4) {
    const seed = trendingPublications(8);
    const slugs = new Set(trend.map((p) => p.slug));
    for (const s of seed) {
      if (!slugs.has(s.slug)) trend.push(s);
      if (trend.length >= 8) break;
    }
  }
  trend = trend.slice(0, 8);

  let fresh: Publication[] = [...live].sort((a, b) =>
    (b.publishedAt || "").localeCompare(a.publishedAt || "")
  );
  if (fresh.length < 3) {
    const seed = newestPublications(6);
    const slugs = new Set(fresh.map((p) => p.slug));
    for (const s of seed) {
      if (!slugs.has(s.slug)) fresh.push(s);
      if (fresh.length >= 6) break;
    }
  }
  fresh = fresh.slice(0, 6);

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:pt-12">
        <section className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Discovery network
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Discover what's being published
          </h1>
          <p className="mt-2 text-[15px] text-zinc-400">
            Articles, music, research, products, events, and opportunities —
            from people, companies, and brands putting work into the world.
          </p>

          <form
            action="/explore"
            method="get"
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              name="q"
              type="search"
              placeholder="Search publications…"
              className="h-12 flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/50"
            />
            <button
              type="submit"
              className="h-12 rounded-xl bg-omniv-gold px-6 text-[14px] font-semibold text-black"
            >
              Explore
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {PUBLICATION_TYPES.map((t) => (
              <Link
                key={t}
                href={`/explore?type=${t}`}
                className="rounded-full border border-white/12 px-3 py-1.5 text-[12px] text-zinc-400 transition hover:border-white/30 hover:text-white"
              >
                {PUBLICATION_LABELS[t]}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/home"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-black"
            >
              Open For You
            </Link>
            <Link
              href="/publish"
              className="inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
            >
              Publish
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[15px] font-semibold text-white">Trending</h2>
            <Link
              href="/explore?sort=trending"
              className="text-[13px] text-zinc-500 hover:text-omniv-gold"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trend.map((p) => (
              <PublicationCard key={p.id} pub={p} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[15px] font-semibold text-white">New on Omniv</h2>
            <Link
              href="/explore?sort=new"
              className="text-[13px] text-zinc-500 hover:text-omniv-gold"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.map((p) => (
              <PublicationCard key={p.id} pub={p} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[15px] font-semibold text-white">Explore</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXPLORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] text-zinc-400 transition hover:border-white/25 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Have something worth putting into the world?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-zinc-400">
            Publish articles, music, research, products, events, or opportunities.
            Own your public discovery layer.
          </p>
          <Link
            href="/publish"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black transition hover:bg-omniv-gold/90"
          >
            Publish on Omniv
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
