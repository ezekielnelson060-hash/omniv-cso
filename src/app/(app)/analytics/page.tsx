"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ChartLine } from "@/components/analytics/chart-line";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  buildSeries,
  comparePeriods,
  formatMetric,
  type AnalyticsRange,
} from "@/data/analytics";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, ArrowLeftRight } from "lucide-react";

const RANGES: { id: AnalyticsRange; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

type MetricKey = "streams" | "followers" | "engagement" | "reach";

const METRIC_TABS: { id: MetricKey; label: string }[] = [
  { id: "streams", label: "Streams" },
  { id: "followers", label: "Followers" },
  { id: "engagement", label: "Engagement" },
  { id: "reach", label: "Reach" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("weekly");
  const [metric, setMetric] = useState<MetricKey>("streams");

  const series = useMemo(() => buildSeries(range), [range]);
  const compare = useMemo(() => comparePeriods(series), [series]);
  const labels = series.map((p) => p.label);
  const primary = series.map((p) => p[metric]);
  const secondaryKey: MetricKey = metric === "streams" ? "engagement" : "streams";
  const secondary = series.map((p) => p[secondaryKey]);
  const latest = series[series.length - 1];
  const prev = series[series.length - 2];
  const latestDelta =
    latest && prev && prev[metric]
      ? Math.round(((latest[metric] - prev[metric]) / prev[metric]) * 1000) / 10
      : 0;

  return (
    <AppShell>
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Historical Analytics</h1>
          <Badge variant="gold">
            <BarChart3 className="mr-1 h-3 w-3" />
            Live series
          </Badge>
        </div>
        <p className="text-sm text-omniv-text-secondary">
          Timeline, growth, and period compare
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-all",
              range === r.id
                ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
                : "border-omniv-border bg-omniv-card text-omniv-text-secondary hover:text-omniv-text"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["streams", "followers", "engagement", "reach"] as const).map((key) => {
          const val = latest?.[key] ?? 0;
          const before = prev?.[key] ?? 0;
          const d = before === 0 ? 0 : Math.round(((val - before) / before) * 1000) / 10;
          const up = d >= 0;
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          return (
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
              <p className="mt-1 text-2xl font-semibold text-omniv-text">{formatMetric(val)}</p>
              <p className={cn("mt-1 inline-flex items-center gap-1 text-xs", up ? "text-omniv-success" : "text-omniv-danger")}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {up ? "+" : ""}
                {d}% vs prior
              </p>
            </button>
          );
        })}
      </div>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-omniv-text">
              {METRIC_TABS.find((m) => m.id === metric)?.label} trend
            </h2>
            <p className="text-xs text-omniv-text-muted">
              {range} · {labels.length} periods
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {METRIC_TABS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetric(m.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px]",
                  metric === m.id ? "bg-omniv-gold/15 text-omniv-gold" : "text-omniv-text-muted"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <ChartLine
          labels={labels}
          series={[
            {
              name: METRIC_TABS.find((m) => m.id === metric)?.label ?? metric,
              data: primary,
              color: "#d4af37",
            },
            {
              name: METRIC_TABS.find((m) => m.id === secondaryKey)?.label ?? secondaryKey,
              data: secondary,
              color: "rgba(163,163,163,0.55)",
            },
          ]}
        />
        <p className="mt-3 text-xs text-omniv-text-muted">
          Latest{" "}
          <span className={cn(latestDelta >= 0 ? "text-omniv-success" : "text-omniv-danger")}>
            {latestDelta >= 0 ? "+" : ""}
            {latestDelta}%
          </span>{" "}
          vs previous
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-medium text-omniv-text">Content activity</h2>
          <p className="mb-4 text-xs text-omniv-text-muted">Posts and videos</p>
          <ChartLine
            height={160}
            labels={labels}
            series={[
              { name: "Posts", data: series.map((p) => p.posts), color: "#d4af37" },
              { name: "Videos", data: series.map((p) => p.videos), color: "#22c55e" },
            ]}
          />
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-omniv-gold" />
            <div>
              <h2 className="text-sm font-medium text-omniv-text">Period compare</h2>
              <p className="text-xs text-omniv-text-muted">Second half vs first half</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {compare.map((row) => {
              const up = row.deltaPct >= 0;
              return (
                <div
                  key={row.metric}
                  className="flex items-center justify-between rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm text-omniv-text">{row.metric}</p>
                    <p className="text-[11px] text-omniv-text-muted">
                      {formatMetric(row.previous)} → {formatMetric(row.current)}
                    </p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 text-sm font-medium", up ? "text-omniv-success" : "text-omniv-danger")}>
                    {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {up ? "+" : ""}
                    {row.deltaPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
