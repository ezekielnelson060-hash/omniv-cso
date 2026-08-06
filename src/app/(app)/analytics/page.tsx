"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ChartLine } from "@/components/analytics/chart-line";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { computeScoresFromBrain } from "@/lib/strategy/scores";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ArtistScore } from "@/types";

function buildPersonalSeries(scores: ArtistScore) {
  const base = Math.max(20, scores.overall - 18);
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const overall = Math.round(base + (scores.overall - base) * t);
    return {
      label: `W${i + 1}`,
      overall,
      growth: Math.round(overall * (scores.growth / Math.max(1, scores.overall))),
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
  const [metric, setMetric] = useState<
    "overall" | "growth" | "momentum" | "content" | "readiness"
  >("overall");

  useEffect(() => {
    (async () => {
      const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
      setName(b?.stageName || b?.name || p?.full_name || "Your project");
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
      ? "Forward. Modelled trajectory is climbing on this lever."
      : delta < -2
        ? "Falling back. This lever needs a corrective move this week."
        : "Steady. Small disciplined actions will tip momentum.";

  if (!scores) {
    return (
      <AppShell>
        <p className="text-sm text-omniv-text-muted">Loading analytics…</p>
      </AppShell>
    );
  }

  const tiles = [
    ["overall", "Overall", scores.overall],
    ["growth", "Growth", scores.growth],
    ["momentum", "Momentum", scores.momentum],
    ["content", "Content", scores.contentHealth],
    ["readiness", "Release readiness", scores.releaseReadiness],
  ] as const;

  return (
    <AppShell>
      <div className="mb-6">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Historical Analytics
          </h1>
          <Badge variant="gold">
            <BarChart3 className="mr-1 h-3 w-3" />
            {name}
          </Badge>
        </div>
        <p className="text-sm text-omniv-text-secondary">
          Direction of travel from your Artist Brain. Live platform charts unlock
          when OAuth is connected.
        </p>
      </div>

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
                Score trajectory · 8 weeks
              </h2>
              <p className="text-xs text-omniv-text-muted">
                Modelled path for {name}. Select a tile to switch lever.
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
    </AppShell>
  );
}
