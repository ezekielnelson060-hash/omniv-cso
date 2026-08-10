"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import {
  computeScoresFromBrain,
  overallNarrative,
} from "@/lib/strategy/scores";
import { listCatalogueReleases } from "@/lib/catalogue/db";
import { listCatalogueTracks } from "@/lib/catalogue/tracks";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ArtistScore } from "@/types";
import {
  Target,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MetricKey =
  | "overall"
  | "growth"
  | "momentum"
  | "content"
  | "readiness";

type Signals = {
  links: number;
  fans: number;
  fans7d: number;
  tracks: number;
  releases: number;
  unreleased: number;
};

function ringStyle(value: number) {
  const pct = Math.min(100, Math.max(0, value));
  const deg = (pct / 100) * 360;
  return {
    background: `conic-gradient(var(--omniv-gold) ${deg}deg, rgba(255,255,255,0.06) 0deg)`,
  };
}

function Delta({ n, label }: { n: number; label?: string }) {
  if (n > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
        <ArrowUpRight className="h-3 w-3" />
        +{n}
        {label ? ` ${label}` : ""}
      </span>
    );
  if (n < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-rose-400">
        <ArrowDownRight className="h-3 w-3" />
        {n}
        {label ? ` ${label}` : ""}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-omniv-text-muted">
      <Minus className="h-3 w-3" />
      flat
    </span>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ArtistScore | null>(null);
  const [name, setName] = useState("you");
  const [dream, setDream] = useState("Your Big Dream");
  const [metric, setMetric] = useState<MetricKey>("overall");
  const [narrative, setNarrative] = useState("");
  const [momentumRead, setMomentumRead] = useState("");
  const [signals, setSignals] = useState<Signals>({
    links: 0,
    fans: 0,
    fans7d: 0,
    tracks: 0,
    releases: 0,
    unreleased: 0,
  });
  const [popSeries, setPopSeries] = useState<number[]>([]);
  const [avgPop, setAvgPop] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p, releases, tracks] = await Promise.all([
          getArtistBrain(),
          getProfile(),
          listCatalogueReleases(),
          listCatalogueTracks(),
        ]);
        if (cancelled) return;

        const links = Object.values(p?.social_links || {}).filter(
          (u) => (u || "").trim().length > 8
        ).length;
        const platforms = p?.platforms || [];
        const linkedSurfaces = Math.max(links, platforms.length);

        let fans = 0;
        let fans7d = 0;
        let popSeriesLocal: number[] = [];
        let avgPopLocal: number | null = null;
        if (isSupabaseConfigured()) {
          try {
            const sb = createClient();
            const {
              data: { user },
            } = await sb.auth.getUser();
            if (user) {
              const { count } = await sb
                .from("fans")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id);
              fans = count || 0;
              const weekAgo = new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString();
              const { count: c7 } = await sb
                .from("fans")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gte("created_at", weekAgo);
              fans7d = c7 || 0;

              const { data: metrics } = await sb
                .from("platform_metrics")
                .select("popularity, fetched_at")
                .eq("user_id", user.id)
                .order("fetched_at", { ascending: true })
                .limit(24);
              if (metrics?.length) {
                const series = metrics
                  .map((m) => m.popularity)
                  .filter((n): n is number => typeof n === "number");
                if (series.length) {
                  popSeriesLocal = series;
                  avgPopLocal = Math.round(
                    series.reduce((a, b) => a + b, 0) / series.length
                  );
                }
              }
            }
          } catch {
            /* optional */
          }
        }

        const trackCount = tracks.filter(
          (t) => t.audioPath || t.analysis
        ).length;
        const releaseCount = releases.length;
        const unreleasedCount = releases.filter(
          (r) =>
            r.status === "draft" ||
            r.status === "idea" ||
            r.status === "scheduled"
        ).length;

        if (cancelled) return;

        const sig: Signals = {
          links: linkedSurfaces,
          fans,
          fans7d,
          tracks: trackCount,
          releases: releaseCount,
          unreleased: unreleasedCount,
        };
        setSignals(sig);
        if (popSeriesLocal.length) setPopSeries(popSeriesLocal);
        if (avgPopLocal != null) setAvgPop(avgPopLocal);

        const s = computeScoresFromBrain(b, {
          platforms,
          interests: p?.interests || [],
          linkedSurfaces,
          fanCount: fans,
          fans7d,
          trackCount,
          releaseCount,
          unreleasedCount,
        });
        setScores(s);
        setName(b?.stageName || b?.name || p?.full_name || "you");
        setDream(
          b?.bigDream || b?.goals?.[0] || "Name the dream in Artist Brain"
        );
        setNarrative(overallNarrative(s, b));
        setMomentumRead(
          s.momentum >= 70
            ? "Forward. Protect the window."
            : s.momentum >= 45
              ? "Moving, not yet dangerous."
              : "Flat or falling. Fix the softest score first."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !scores) {
    return (
      <AppShell>
        <div className="flex items-center gap-2 py-16 text-xs text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
          Loading progress…
        </div>
      </AppShell>
    );
  }

  const tiles: {
    key: MetricKey;
    label: string;
    value: number;
    hint: string;
  }[] = [
    {
      key: "overall",
      label: "Align",
      value: scores.overall,
      hint: "vs Big Dream",
    },
    {
      key: "growth",
      label: "Growth",
      value: scores.growth,
      hint: "reach capacity",
    },
    {
      key: "momentum",
      label: "Motion",
      value: scores.momentum,
      hint: "week energy",
    },
    {
      key: "content",
      label: "Content",
      value: scores.contentHealth,
      hint: "output health",
    },
    {
      key: "readiness",
      label: "Release",
      value: scores.releaseReadiness,
      hint: "ship readiness",
    },
  ];

  const active = tiles.find((t) => t.key === metric) || tiles[0]!;
  const softest = [...tiles].sort((a, b) => a.value - b.value)[0]!;
  const spark =
    popSeries.length >= 2
      ? popSeries.slice(-12)
      : [
          28, 32, 30, 38, 36, 42, 40, 48, 45, 52, 50,
          Math.max(signals.fans, 12),
        ];
  const sparkMax = Math.max(...spark, 1);

  return (
    <AppShell>
      <div className="relative -mx-3 mb-4 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-omniv-gold/15 via-omniv-gold/5 to-transparent" />
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-omniv-gold/10 blur-3xl" />
        <div className="relative px-3 pb-5 pt-1 sm:px-4 md:px-5 md:pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
                Progress
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight md:text-[1.65rem]">
                {name}
              </h1>
              <p className="mt-1 max-w-md text-[12px] text-omniv-text-secondary">
                Live scores from links, owned fans, and catalogue — not vanity
                stream guesses.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="relative flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center rounded-full p-[3px]"
                style={ringStyle(active.value)}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-omniv-black">
                  <span className="font-data text-3xl font-semibold tabular-nums tracking-tight text-omniv-text">
                    {active.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                    / 100
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-omniv-gold">
                  {active.label}
                </p>
                <p className="mt-0.5 text-sm text-omniv-text-secondary">
                  {active.hint}
                </p>
                <p className="mt-2 max-w-[14rem] text-[12px] leading-snug text-omniv-text-muted">
                  {momentumRead}
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-md flex-wrap gap-1.5 sm:justify-end">
              {tiles.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setMetric(t.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                    metric === t.key
                      ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                      : "border-omniv-border bg-omniv-card/80 text-omniv-text-muted hover:border-omniv-border-subtle hover:text-omniv-text"
                  )}
                >
                  {t.label}
                  <span className="ml-1.5 tabular-nums opacity-80">
                    {t.value}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          {
            label: "Owned fans",
            value: signals.fans,
            delta: signals.fans7d,
            deltaLabel: "7d",
            href: "/crm",
          },
          {
            label: "DSP popularity",
            value: avgPop ?? 0,
            delta: 0,
            sub: avgPop != null ? "avg snapshot" : "link Spotify",
            href: "/settings",
          },
          {
            label: "Analysed tracks",
            value: signals.tracks,
            delta: 0,
            href: "/catalogue",
          },
          {
            label: "Releases",
            value: signals.releases,
            sub:
              signals.unreleased > 0
                ? `${signals.unreleased} unreleased`
                : undefined,
            delta: 0,
            href: "/catalogue",
          },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-omniv-border bg-omniv-card p-3.5 transition hover:border-omniv-gold/25 hover:bg-omniv-hover"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              {c.label}
            </p>
            <p className="mt-1.5 font-data text-2xl font-semibold tabular-nums tracking-tight">
              {c.value.toLocaleString()}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              {"sub" in c && c.sub ? (
                <span className="text-[11px] text-omniv-text-muted">{c.sub}</span>
              ) : (
                <Delta n={c.delta} label={"deltaLabel" in c ? c.deltaLabel : undefined} />
              )}
              <ChevronRight className="h-3.5 w-3.5 text-omniv-text-muted opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-3 flex h-8 items-end gap-0.5">
              {spark.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-omniv-gold/30"
                  style={{
                    height: `${Math.max(12, (h / sparkMax) * 100)}%`,
                    opacity: 0.4 + (i / spark.length) * 0.55,
                  }}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card">
        <div className="border-b border-omniv-border px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Score board
          </p>
          <p className="mt-0.5 text-[11px] text-omniv-text-muted">
            Softest first · fix {softest.label} to lift overall
          </p>
        </div>
        <ul className="divide-y divide-omniv-border">
          {[...tiles]
            .sort((a, b) => a.value - b.value)
            .map((t, i) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => setMetric(t.key)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.02]",
                    metric === t.key && "bg-omniv-gold/5"
                  )}
                >
                  <span className="w-5 font-data text-[11px] tabular-nums text-omniv-text-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium">{t.label}</span>
                      <span className="font-data text-sm font-semibold tabular-nums text-omniv-gold">
                        {t.value}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-omniv-gold/70"
                        style={{ width: `${t.value}%` }}
                      />
                    </div>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      </div>

      <div className="mb-4 rounded-2xl border border-omniv-gold/25 bg-gradient-to-br from-omniv-gold/10 to-transparent p-4">
        <div className="flex items-start gap-2.5">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
              Big Dream
            </p>
            <p className="mt-1 text-[14px] font-medium leading-snug">{dream}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-omniv-text-secondary">
              {narrative}
            </p>
          </div>
          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 text-[11px]"
            >
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/opportunities">
          <Button className="h-10 gap-1.5 rounded-xl px-4">
            Open Moves
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/crm">
          <Button variant="outline" className="h-10 rounded-xl px-4">
            Command Center
          </Button>
        </Link>
        <Link href="/ziki">
          <Button variant="outline" className="h-10 rounded-xl px-4">
            Ask Ziki
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
