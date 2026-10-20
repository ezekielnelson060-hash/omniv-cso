"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { AnalyticsGrowthCta } from "@/components/discovery/analytics-growth-cta";

type Range = "7d" | "30d" | "90d" | "1y";

type Metrics = {
  views: number;
  opens: number;
  completes: number;
  likes: number;
  shares: number;
  downloads?: number;
  saves: number;
  follows: number;
  qualified: number;
  videoPlays?: number;
  videoCompletes?: number;
};

type Funnel = {
  views: number;
  opens: number;
  saves: number;
  follows: number;
  videoPlays: number;
  videoProgress50: number;
  videoProgress90: number;
  videoCompletes: number;
  completes: number;
  downloads?: number;
};

type TopPub = {
  id: string;
  slug: string;
  title: string;
  type: string;
  heat: number;
  opens?: number;
  downloads?: number;
  videoPlays?: number;
  videoCompletes?: number;
  completionRate?: number;
};

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-[22px] font-semibold tabular-nums text-white">
        {value}
      </p>
      {note ? (
        <p className="mt-0.5 text-[11px] text-zinc-600">{note}</p>
      ) : null}
    </div>
  );
}

export default function AnalyticsPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [heat, setHeat] = useState(0);
  const [pubCount, setPubCount] = useState(0);
  const [topPubs, setTopPubs] = useState<TopPub[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [real, setReal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActive(readActiveAccount());
    return onAccountSwitch(() => {
      setActive(readActiveAccount());
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
        if (data.auth) {
          setMetrics(data.metrics || null);
          setHeat(Number(data.heat || 0));
          setPubCount(Number(data.publications || 0));
          setTopPubs(data.topPublications || []);
          setFunnel(data.funnel || null);
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

  const m = metrics || {
    views: 0,
    opens: 0,
    completes: 0,
    likes: 0,
    shares: 0,
    downloads: 0,
    saves: 0,
    follows: 0,
    qualified: 0,
  };

  const ranges: { id: Range; label: string }[] = [
    { id: "7d", label: "7d" },
    { id: "30d", label: "30d" },
    { id: "90d", label: "90d" },
    { id: "1y", label: "1y" },
  ];

  const exportRows = [
    {
      range,
      opens: m.views || m.opens,
      saves: m.saves,
      follows: m.follows,
      downloads: m.downloads || 0,
      likes: m.likes,
      shares: m.shares,
      videoPlays: m.videoPlays || 0,
      videoCompletes: m.videoCompletes || 0,
      qualified: m.qualified,
      heat,
      publications: pubCount,
    },
    ...topPubs.map((p) => ({
      publication: p.title,
      type: p.type,
      opens: p.opens || 0,
      downloads: p.downloads || 0,
      videoPlays: p.videoPlays || 0,
      heat: p.heat,
    })),
  ];

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050505]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between md:max-w-2xl">
            <h1 className="text-[17px] font-semibold text-white">Analytics</h1>
            <AnalyticsExport
              filename={`omniv-analytics-${range}`}
              rows={exportRows}
            />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          <CurrentIdentityBanner />

          <div className="mt-4 flex gap-2">
            {ranges.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${
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
                  ? "Live counts from signals, saves, follows, downloads, and video events"
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
                  label="Downloads"
                  value={formatNum(m.downloads || 0)}
                  note="Audio · video · PDF"
                />
                <Stat
                  label="Qualified"
                  value={formatNum(m.qualified)}
                  note="Saves · follows · downloads · likes"
                />
                <Stat
                  label="Publications"
                  value={formatNum(pubCount)}
                  note="This identity"
                />
                {(m.videoPlays || 0) > 0 && (
                  <>
                    <Stat
                      label="Video plays"
                      value={formatNum(m.videoPlays || 0)}
                      note="Starts"
                    />
                    <Stat
                      label="Video completes"
                      value={formatNum(m.videoCompletes || 0)}
                      note={
                        m.videoPlays
                          ? `${Math.round(((m.videoCompletes || 0) / m.videoPlays) * 100)}% completion`
                          : "Ends"
                      }
                    />
                  </>
                )}
              </div>

              {funnel && (funnel.videoPlays > 0 || funnel.opens > 0) && (
                <section className="mt-8">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Funnel
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {(
                      [
                        ["Views / opens", funnel.views || funnel.opens],
                        ["Saves", funnel.saves],
                        ["Follows", funnel.follows],
                        ["Downloads", funnel.downloads || 0],
                        ["Video plays", funnel.videoPlays],
                        ["Reached 50%", funnel.videoProgress50],
                        ["Reached 90%", funnel.videoProgress90],
                        ["Completes", funnel.videoCompletes || funnel.completes],
                      ] as [string, number][]
                    )
                      .filter(([, v]) => Number(v) > 0)
                      .map(([label, value]) => (
                        <li
                          key={label}
                          className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[13px]"
                        >
                          <span className="text-zinc-400">{label}</span>
                          <span className="font-semibold text-white">
                            {formatNum(Number(value))}
                          </span>
                        </li>
                      ))}
                  </ul>
                </section>
              )}

              <AnalyticsGrowthCta
                show={
                  pubCount > 0 &&
                  (heat > 0 || m.saves + m.follows + m.opens > 0)
                }
              />

              {topPubs.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Top publications
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {topPubs.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06]"
                      >
                        <p className="text-[14px] font-medium text-white">
                          {p.title}
                        </p>
                        <p className="mt-1 text-[12px] text-zinc-500">
                          {p.type}
                          {p.opens ? ` · ${p.opens} opens` : ""}
                          {p.downloads ? ` · ${p.downloads} downloads` : ""}
                          {p.videoPlays ? ` · ${p.videoPlays} plays` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
