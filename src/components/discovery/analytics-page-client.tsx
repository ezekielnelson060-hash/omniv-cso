"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { AnalyticsExport } from "@/components/discovery/analytics-export";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";
import { DISCOVERY_PLANS } from "@/lib/discovery/monetization";
import { AnalyticsGrowthCta } from "@/components/discovery/analytics-growth-cta";

type Range = "7d" | "30d" | "90d" | "1y";

type Metrics = {
  views: number;
  opens: number;
  completes: number;
  likes: number;
  shares: number;
  saves: number;
  follows: number;
  qualified: number;
};

type TopPub = {
  id: string;
  slug: string;
  title: string;
  type: string;
  heat: number;
};

export default function AnalyticsPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [personalName, setPersonalName] = useState("You");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [heat, setHeat] = useState(0);
  const [pubCount, setPubCount] = useState(0);
  const [topPubs, setTopPubs] = useState<TopPub[]>([]);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [real, setReal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActive(readActiveAccount());
    setPersonalName(readProfile().displayName || "You");
    return onAccountSwitch(() => {
      setActive(readActiveAccount());
      setPersonalName(readProfile().displayName || "You");
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams({ range });
        if (active?.id) qs.set("entityId", active.id);
        const res = await fetch(`/api/discovery/analytics?${qs}`);
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        if (data.auth && data.metrics) {
          setMetrics(data.metrics as Metrics);
          setHeat(Number(data.heat || 0));
          setPubCount(Number(data.publications || 0));
          setTopPubs(
            Array.isArray(data.topPublications) ? data.topPublications : []
          );
          setSources(
            data.sources && typeof data.sources === "object"
              ? data.sources
              : {}
          );
          setReal(Boolean(data.real));
        }
      } catch {
        if (!cancelled) setAuth(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range, active?.id]);

  const entityName = active?.name || personalName;
  const m = metrics || {
    views: 0,
    opens: 0,
    completes: 0,
    likes: 0,
    shares: 0,
    saves: 0,
    follows: 0,
    qualified: 0,
  };

  const sourceRows = Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt=""
                width={28}
                height={28}
                className="rounded-md md:hidden"
              />
              <div>
                <p className="text-[12px] text-zinc-500">{entityName}</p>
                <h1 className="text-[17px] font-semibold text-white">
                  Analytics
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AnalyticsExport
                rows={[
                  { metric: "views", value: m.views, range },
                  { metric: "opens", value: m.opens, range },
                  { metric: "saves", value: m.saves, range },
                  { metric: "follows", value: m.follows, range },
                  { metric: "qualified", value: m.qualified, range },
                  { metric: "heat", value: heat, range },
                ]}
              />
              <Link
                href="/pricing"
                className="text-[13px] font-medium text-omniv-gold"
              >
                Pro
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <div className="mb-4">
            <CurrentIdentityBanner action="Analytics for" />
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { id: "7d" as const, label: "7D" },
                { id: "30d" as const, label: "30D" },
                { id: "90d" as const, label: "90D" },
                { id: "1y" as const, label: "1Y" },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`inline-flex h-8 items-center justify-center rounded-full px-3.5 text-[12px] font-semibold leading-none ${
                  range === r.id
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {auth === false && (
            <div className="mt-12 text-center">
              <p className="text-zinc-500">Sign in to see analytics.</p>
              <Link
                href="/signup?next=/analytics"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && loading && (
            <p className="mt-12 text-center text-[14px] text-zinc-600">
              Loading…
            </p>
          )}

          {auth && !loading && (
            <>
              <p className="mt-3 text-[11px] text-zinc-600">
                {real
                  ? "Live counts from signals, saves, and follows"
                  : "Waiting for event data"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat
                  label="Opens / views"
                  value={formatNum(m.views || m.opens)}
                  note="Real"
                />
                <Stat
                  label="Heat score"
                  value={formatNum(heat)}
                  note="Publication heat sum"
                />
                <Stat label="Saves" value={formatNum(m.saves)} note="Real" />
                <Stat
                  label="Follows"
                  value={formatNum(m.follows)}
                  note="Real"
                />
                <Stat
                  label="Qualified"
                  value={formatNum(m.qualified)}
                  note="Saves · follows · completes · likes"
                />
                <Stat
                  label="Publications"
                  value={formatNum(pubCount)}
                  note="This identity"
                />
              </div>

              <AnalyticsGrowthCta
                show={
                  pubCount > 0 &&
                  (heat > 0 || m.saves + m.follows + m.opens > 0)
                }
              />

              {sourceRows.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Sources
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {sourceRows.map(([src, n]) => (
                      <li
                        key={src}
                        className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5"
                      >
                        <span className="truncate text-[14px] text-white">
                          {src}
                        </span>
                        <span className="text-[12px] text-zinc-500">{n}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {topPubs.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Publications
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {topPubs.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/p/${p.slug}`}
                          className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium text-white">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-zinc-500">{p.type}</p>
                          </div>
                          <span className="text-[12px] text-zinc-500">
                            heat {p.heat || 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-10 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
                <p className="text-[14px] font-semibold text-white">
                  {DISCOVERY_PLANS.pro.name} unlocks deeper stats
                </p>
                <p className="mt-2 text-[13px] text-zinc-500">
                  Funnels, cohort retention, and export-ready demand graphs.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
                >
                  View plans
                </Link>
              </div>
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <p className="text-[12px] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-zinc-600">{note}</p>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
