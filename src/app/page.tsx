import Link from "next/link";
import { NetworkHeader } from "@/components/discovery/network-header";
import { EntityCard } from "@/components/discovery/entity-card";
import { SiteFooter } from "@/components/site-footer";
import { newest, trending } from "@/lib/discovery/seed";
import { INTENT_LABELS, type IntentKind } from "@/lib/discovery/types";

const LOOKING_FOR: { kind: IntentKind; href: string }[] = [
  { kind: "creators", href: "/explore?intent=creators" },
  { kind: "investors", href: "/explore?intent=investors" },
  { kind: "hires", href: "/explore?intent=hires" },
  { kind: "partners", href: "/explore?intent=partners" },
  { kind: "customers", href: "/explore?intent=customers" },
  { kind: "beta_users", href: "/explore?intent=beta_users" },
];

const CATEGORIES = [
  "Business",
  "Technology",
  "Fashion",
  "Culture",
  "Products",
  "Events",
  "Projects",
  "Media",
];

export default function DiscoveryHomePage() {
  const trend = trending(6);
  const fresh = newest(4);

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:pt-14">
        <section className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Discovery network
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            What are you looking for?
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-400">
            Find people, companies, brands, products, projects, and opportunities
            — with intent, not just a name.
          </p>

          <form action="/explore" method="get" className="mx-auto mt-8 max-w-xl">
            <label htmlFor="q" className="sr-only">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Search people, companies, brands, products…"
              className="h-12 w-full rounded-full border border-white/15 bg-white/[0.04] px-5 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/50 focus:ring-1 focus:ring-omniv-gold/30"
            />
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {["Explore", "New", "Trending", "Opportunities"].map((label) => (
              <Link
                key={label}
                href={
                  label === "Explore"
                    ? "/explore"
                    : label === "New"
                      ? "/explore?sort=new"
                      : label === "Trending"
                        ? "/explore?sort=trending"
                        : "/explore?type=opportunity"
                }
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-[12px] text-zinc-400 transition hover:border-white/25 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Trending now</h2>
            <Link
              href="/explore?sort=trending"
              className="text-[13px] text-zinc-500 hover:text-omniv-gold"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trend.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-white">Looking for…</h2>
          <p className="mt-1 text-[13px] text-zinc-500">
            Intent on the listing — not buried in a bio.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {LOOKING_FOR.map(({ kind, href }) => (
              <Link
                key={kind}
                href={href}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[14px] text-zinc-300 transition hover:border-omniv-gold/40 hover:text-white"
              >
                {INTENT_LABELS[kind]}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">New on Omniv</h2>
            <Link
              href="/explore?sort=new"
              className="text-[13px] text-zinc-500 hover:text-omniv-gold"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {fresh.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-white">Explore categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/explore?q=${encodeURIComponent(c)}`}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] text-zinc-400 transition hover:border-white/25 hover:text-white"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Have something worth discovering?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-zinc-400">
            Publish a company, brand, product, project, event, or opportunity.
            Own your public discovery layer.
          </p>
          <Link
            href="/signup?from=publish"
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
