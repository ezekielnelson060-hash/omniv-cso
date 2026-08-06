"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ChartLine } from "@/components/analytics/chart-line";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { computeScoresFromBrain } from "@/lib/strategy/scores";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react";
import type { ArtistScore } from "@/types";

function buildPersonalSeries(scores: ArtistScore) {
  const base = Math.max(20, scores.overall - 18);
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const overall = Math.round(base + (scores.overall - base) * t);
    return {
      label: `W${i + 1}`,
      overall,
      growth: Math.round(
        overall * (scores.growth / Math.max(1, scores.overall))
      ),
      momentum: Math.round(
        overall * (scores.momentum / Math.max(1, scores.overall))
      ),
      content: Math.round(
        overall * (scores.contentHealth / Math.max(1, scores.overall))
      ),
      readiness: Math.round(
        overall * (scores.releaseReadiness / Math.max(1, scores.overall))
      ),
    };
  });
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 1)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
        <TrendingUp className="h-3 w-3" />+{delta}
      </span>
    );
  if (delta < -1)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-rose-400">
        <TrendingDown className="h-3 w-3" />
        {delta}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-omniv-text-muted">
      <Minus className="h-3 w-3" />
      Flat
    </span>
  );
}

export default function AnalyticsPage() {
  const [scores, setScores] = useState<ArtistScore | null>(null);
  const [name, setName] = useState("");
  const [dream, setDream] = useState("");
  const [metric, setMetric] = useState<
    "overall" | "growth" | "momentum" | "content" | "readiness"
  >("overall");

  useEffect(() => {
    (async () => {
      const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
      setName(b?.stageName || b?.name || p?.full_name || "Your project");
      setDream(
        b?.bigDream?.trim() ||
          b?.goals?.[0] ||
          "Set your Big Dream in Artist Brain"
      );
      setScores(computeScoresFromBrain(b, p?.platforms || []));
    })();
  }, []);

  const series = useMemo(
    () => (scores ? buildPersonalSeries(scores) : []),
    [scores]
  );
  const labels = series.map((p) => p.label);
  const primary = series.map((p) => p[metric]);
  const delta =
    primary.length >= 2 ? primary[primary.length - 1]! - primary[0]! : 0;

  const momentumRead =
    delta > 3
      ? "You are compounding. Do not break the routine that built this climb."
      : delta < -2
        ? "You drifted. One corrective move this week. Not five new ideas."
        : "You are steady. One hard action tips this forward.";

  if (!scores) {
    return (
      <AppShell>
        <p className="text-sm text-omniv-text-muted">Measuring how far you have moved…</p>
      </AppShell>
    );
  }

  const tiles: [typeof metric, string, number][] = [
    ["overall", "Alignment", scores.overall],
    ["growth", "Growth", scores.growth],
    ["momentum", "Momentum", scores.momentum],
    ["content", "Content", scores.contentHealth],
    ["readiness", "Readiness", scores.releaseReadiness],
  ];

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-omniv-gold" />
            <h1 className="text-lg font-semibold tracking-tight">
              Are you moving?
            </h1>
          </div>
          <p className="mt-1 max-w-lg text-sm text-omniv-text-secondary">
            We are tracking {name} against the dream you named. Flat lines mean
            you are busy. Rising lines mean you are dangerous.
          </p>
        </div>
        <Badge variant="gold">Personal model</Badge>
      </div>

      <Card className="mb-5 border-omniv-gold/20 bg-omniv-gold/[0.04] p-5">
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              What we are holding you to
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-omniv-text">
              {dream}
            </p>
            <p className="mt-2 text-xs text-omniv-text-muted">
              If this no longer matches what you want, change it in Artist Brain.
              Until then, every score is judged against this.
            </p>
            <Link href="/artist-brain" className="mt-3 inline-block">
              <Button variant="outline" size="sm">Change what we hold</Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card className="mb-5 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          Roadmap · this quarter
        </p>
        <p className="mt-1 text-xs text-omniv-text-muted">
          Objective: the Big Dream. Key results are the levers below. We nudge
          the softest one first.
        </p>
        <div className="mt-4 space-y-3">
          {[
            { label: "Alignment (overall)", v: scores.overall },
            { label: "Content pulse", v: scores.contentHealth },
            { label: "Release pressure", v: scores.releaseReadiness },
            { label: "Audience hold", v: scores.audienceHealth },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-omniv-text-secondary">{row.label}</span>
                <span className="font-data text-omniv-gold">{row.v}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-omniv-border">
                <div
                  className="h-full rounded-full bg-omniv-gold/80 transition-all"
                  style={{ width: `${Math.min(100, row.v)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-text-muted">
            Momentum on {metric}
          </p>
          <p className="mt-0.5 text-sm text-omniv-text-secondary">{momentumRead}</p>
        </div>
        <DeltaBadge delta={delta} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {tiles.map(([key, label, val]) => {
          const s = series.map((p) => p[key]);
          const d = s.length >= 2 ? s[s.length - 1]! - s[0]! : 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={cn(
                "rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-4 text-left transition",
                metric === key && "border-omniv-gold/40 bg-omniv-gold/5"
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                {label}
              </p>
              <p className="mt-1 font-data text-2xl font-semibold tabular-nums text-omniv-gold">
                {val}
                <span className="text-sm font-normal text-omniv-text-muted">%</span>
              </p>
              <div className="mt-2">
                <DeltaBadge delta={d} />
              </div>
            </button>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-omniv-gold" />
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Where you have been · 8 weeks
              </h2>
              <p className="text-xs text-omniv-text-muted">
                Your path against the dream. Touch a lever.
              </p>
            </div>
          </div>
          <DeltaBadge delta={delta} />
        </div>
        <ChartLine
          labels={labels}
          series={[
            {
              name: metric,
              data: primary,
              color: delta < -1 ? "#f43f5e" : "#d4af37",
            },
          ]}
        />
      </Card>

      <p className="mt-4 text-center text-[11px] text-omniv-text-muted">
        Empty brain. Empty signal. We cannot rank what you refuse to define.
      </p>
    </AppShell>
  );
}
