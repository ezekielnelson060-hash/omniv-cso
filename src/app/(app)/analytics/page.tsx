"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ChartLine } from "@/components/analytics/chart-line";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { computeScoresFromBrain } from "@/lib/strategy/scores";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp } from "lucide-react";
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

  if (!scores) {
    return (
      <AppShell>
        <p className="text-sm text-omniv-text-muted">Loading analytics…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Historical Analytics
          </h1>
          <Badge variant="gold">
            <BarChart3 className="mr-1 h-3 w-3" />
            {name}
          </Badge>
        </div>
        <p className="text-sm text-omniv-text-secondary">
          Score trajectory derived from your Artist Brain. Live streaming charts
          appear when platform OAuth is connected.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(
          [
            ["overall", "Overall", scores.overall],
            ["growth", "Growth", scores.growth],
            ["momentum", "Momentum", scores.momentum],
            ["content", "Content", scores.contentHealth],
            ["readiness", "Readiness", scores.releaseReadiness],
          ] as const
        ).map(([key, label, val]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMetric(key)}
            className={cn(
              "card-elevated p-4 text-left",
              metric === key && "border-omniv-gold/30 glow-gold"
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              {label}
            </p>
            <p className="mt-1 font-data text-2xl font-semibold text-omniv-gold">
              {val}
            </p>
          </button>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-omniv-gold" />
          <div>
            <h2 className="text-sm font-medium">Score trajectory · 8 weeks</h2>
            <p className="text-xs text-omniv-text-muted">
              Modelled from current Command Center inputs for {name}
            </p>
          </div>
        </div>
        <ChartLine
          labels={labels}
          series={[
            {
              name: metric,
              data: primary,
              color: "#d4af37",
            },
          ]}
        />
      </Card>
    </AppShell>
  );
}
