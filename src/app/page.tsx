import Link from "next/link";
import { NetworkHeader } from "@/components/discovery/network-header";
import { EntityCard } from "@/components/discovery/entity-card";
import { SiteFooter } from "@/components/site-footer";
import { newest, trending } from "@/lib/discovery/seed";
import {
  ENTITY_LABELS,
  ENTITY_TYPES,
  INTENT_LABELS,
  type IntentKind,
} from "@/lib/discovery/types";

const LOOKING_FOR: { kind: IntentKind; href: string }[] = [
  { kind: "creators", href: "/explore?intent=creators" },
  { kind: "investors", href: "/explore?intent=investors" },
  { kind: "hires", href: "/explore?intent=hires" },
  { kind: "partners", href: "/explore?intent=partners" },
  { kind: "customers", href: "/explore?intent=customers" },
  { kind: "beta_users", href: "/explore?intent=beta_users" },
];

export default function DiscoveryHomePage() {
  const trend = trending(8);
  const fresh = newest(4);

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:pt-12">
        {/* Start discovering — product surface, not SaaS pitch */}
        <section className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start discovering
          </h1>
          <p className="mt-2 text-[15px] text-zinc-400">
            Search for what you want to find — then filter by type and intent.
          </p>

          <form
            action="/explore"
            method="get"
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              name="q"
              type="search"
              placeholder="Search people, companies, brands, products…"
              className="h-12 flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/50"
            />
            <button
              type="submit"
              className="h-12 rounded-xl bg-omniv-gold px-6 text-[14px] font-semibold text-black"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {ENTITY_TYPES.map((t) => (
              <Link
                key={t}
                href={`/explore?type=${t}`}
                className="rounded-full border border-white/12 px-3 py-1.5 text-[12px] text-zinc-400 transition hover:border-white/30 hover:text-white"
              >
                {ENTITY_LABELS[t]}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[15px] font-semibold text-white">
              Recommended trending
            </h2>
            <Link
              href="/explore?sort=trending"
              className="text-[13px] text-zinc-500 hover:text-omniv-gold"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trend.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Looking for…</h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              What kind of signal do you want to see?
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {LOOKING_FOR.map(({ kind, href }) => (
                <Link
                  key={kind}
                  href={href}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px] text-zinc-300 transition hover:border-omniv-gold/40 hover:text-white"
                >
                  {INTENT_LABELS[kind]}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">New on Omniv</h2>
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
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[12px] font-semibold text-white">Publish on Omniv</p>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
              Companies, brands, products, projects, events, opportunities — with
              clear intent so the right people can find you.
            </p>
            <Link
              href="/signup?from=publish"
              className="mt-4 flex h-10 items-center justify-center rounded-full bg-omniv-gold text-[13px] font-semibold text-black"
            >
              Publish
            </Link>
            <Link
              href="/explore"
              className="mt-2 flex h-10 items-center justify-center rounded-full border border-white/15 text-[13px] text-zinc-300"
            >
              Browse all
            </Link>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}              <h2 className="text-[15px] font-semibold text-white">New on Omniv</h2>
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
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[12px] font-semibold text-white">Publish on Omniv</p>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
              Companies, brands, products, projects, events, opportunities — with
              clear intent so the right people can find you.
            </p>
            <Link
              href="/signup?from=publish"
              className="mt-4 flex h-10 items-center justify-center rounded-full bg-omniv-gold text-[13px] font-semibold text-black"
            >
              Publish
            </Link>
            <Link
              href="/explore"
              className="mt-2 flex h-10 items-center justify-center rounded-full border border-white/15 text-[13px] text-zinc-300"
            >
              Browse all
            </Link>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
