"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { zikiPrompts, zikiHref } from "@/lib/ziki-prompts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  MessageSquare,
  Snowflake,
  Sparkles,
} from "lucide-react";

export type FanGateMetricsData = {
  fanCount: number;
  fans7d: number;
  superfanCount: number;
  coldCount: number;
  topSource: string | null;
  sources: { source: string; count: number }[];
  gateSlug?: string | null;
  artistName?: string | null;
};

export function FanGateMetrics(m: FanGateMetricsData) {
  const total = m.fanCount || 0;
  const superPct = total ? Math.round((m.superfanCount / total) * 100) : 0;
  const coldPct = total ? Math.round((m.coldCount / total) * 100) : 0;
  const growthLabel =
    m.fans7d > 0 ? `+${m.fans7d}` : m.fanCount === 0 ? "—" : "0";

  const briefHref = zikiHref(
    zikiPrompts.gateMetricsBrief({
      artistName: m.artistName || "this artist",
      fanCount: m.fanCount,
      fans7d: m.fans7d,
      superfanPct: superPct,
      coldPct,
      topSource: m.topSource,
      gateSlug: m.gateSlug,
    })
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-omniv-border px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-omniv-gold" />
          <div>
            <h3 className="text-sm font-medium">Fan gate metrics</h3>
            <p className="text-[11px] text-omniv-text-muted">
              Owned-list health from capture + tiers
            </p>
          </div>
        </div>
        <Link href={briefHref}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Brief Ziki
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px bg-omniv-border/60 sm:grid-cols-4">
        <Metric
          label="Owned fans"
          value={String(total)}
          icon={<Activity className="h-3.5 w-3.5 text-omniv-gold" />}
        />
        <Metric
          label="New · 7d"
          value={growthLabel}
          accent={m.fans7d > 0}
          icon={<ArrowUpRight className="h-3.5 w-3.5 text-omniv-gold" />}
        />
        <Metric
          label="Superfan %"
          value={`${superPct}%`}
          icon={<Sparkles className="h-3.5 w-3.5 text-omniv-gold" />}
        />
        <Metric
          label="Cold %"
          value={`${coldPct}%`}
          icon={<Snowflake className="h-3.5 w-3.5 text-omniv-gold" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
          Sources
        </span>
        {m.sources.length === 0 && (
          <span className="text-xs text-omniv-text-muted">
            No captures yet — share the gate link
          </span>
        )}
        {m.sources.slice(0, 5).map((s) => (
          <Badge key={s.source} variant="outline">
            {s.source || "unknown"} · {s.count}
          </Badge>
        ))}
        {m.gateSlug && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <a
              href={`/f/${m.gateSlug}?source=bio`}
              target="_blank"
              rel="noreferrer"
              className="font-data text-[11px] text-omniv-gold hover:underline"
            >
              /f/{m.gateSlug}
            </a>
            <button
              type="button"
              className="rounded-lg border border-omniv-border px-2 py-1 text-[11px] font-medium text-omniv-text-secondary hover:border-omniv-gold/40 hover:text-omniv-gold"
              onClick={() => {
                const origin =
                  typeof window !== "undefined"
                    ? window.location.origin
                    : "https://omniv.media";
                void navigator.clipboard.writeText(
                  `${origin}/f/${m.gateSlug}?source=bio`
                );
              }}
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="bg-omniv-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-omniv-text-muted">
        {icon}
        {label}
      </div>
      <p
        className={
          accent
            ? "mt-1 font-data text-xl font-semibold text-omniv-gold"
            : "mt-1 font-data text-xl font-semibold text-omniv-text"
        }
      >
        {value}
      </p>
    </div>
  );
}
