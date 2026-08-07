"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import {
  computeScoresFromBrain,
  overallNarrative,
} from "@/lib/strategy/scores";
import type { ArtistScore } from "@/types";
import { BarChart3, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricKey =
  | "overall"
  | "growth"
  | "momentum"
  | "content"
  | "readiness";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ArtistScore | null>(null);
  const [name, setName] = useState("you");
  const [dream, setDream] = useState("Your Big Dream");
  const [metric, setMetric] = useState<MetricKey>("overall");
  const [narrative, setNarrative] = useState("");
  const [momentumRead, setMomentumRead] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
        if (cancelled) return;
        const plats = p?.platforms || [];
        const s = computeScoresFromBrain(b, plats);
        setScores(s);
        setName(b?.stageName || b?.name || p?.full_name || "you");
        setDream(b?.bigDream || b?.goals?.[0] || "Name the dream in Artist Brain");
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
        <div className="flex items-center gap-2 py-8 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
          Loading…
        </div>
      </AppShell>
    );
  }

  const tiles: [MetricKey, string, number][] = [
    ["overall", "Align", scores.overall],
    ["growth", "Growth", scores.growth],
    ["momentum", "Motion", scores.momentum],
    ["content", "Content", scores.contentHealth],
    ["readiness", "Release", scores.releaseReadiness],
  ];

  return (
    <AppShell>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
            Studio
          </p>
          <h1 className="flex items-center gap-1.5 text-lg font-semibold tracking-tight md:text-xl">
            <BarChart3 className="h-4 w-4 text-omniv-gold" />
            Analytics
          </h1>
          <p className="text-[11px] text-omniv-text-muted">
            {name} · vs the dream you named
          </p>
        </div>
        <Badge variant="gold">Personal</Badge>
      </div>

      <Card className="mb-3 border-omniv-gold/20 bg-omniv-gold/[0.04] p-3">
        <div className="flex items-start gap-2">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-omniv-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              Holding you to
            </p>
            <p className="mt-0.5 text-[13px] font-medium leading-snug">{dream}</p>
            <Link href="/artist-brain" className="mt-2 inline-block">
              <Button variant="outline" size="sm" className="h-7 text-[11px]">
                Edit dream
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="mb-3 grid grid-cols-2 gap-1.5 lg:grid-cols-5">
        {tiles.map(([key, label, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMetric(key)}
            className={cn(
              "rounded-lg border bg-omniv-card p-2.5 text-left transition",
              metric === key
                ? "border-omniv-gold/40"
                : "border-omniv-border hover:border-omniv-border-subtle"
            )}
          >
            <p className="text-[9px] font-medium uppercase tracking-wider text-omniv-text-muted">
              {label}
            </p>
            <p className="mt-0.5 font-data text-lg font-semibold tabular-nums text-omniv-gold">
              {value}
              <span className="text-[10px] font-normal text-omniv-text-muted">
                /100
              </span>
            </p>
            <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-omniv-gold/80"
                style={{ width: `${Math.min(100, value)}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      <Card className="mb-3 p-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          Read
        </p>
        <p className="mt-1 text-[12px] leading-snug text-omniv-text-muted">
          {narrative}
        </p>
        <p className="mt-1.5 text-[11px] text-omniv-text-secondary">
          {momentumRead}
        </p>
      </Card>

      <Card className="p-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-omniv-text-muted">
          Focus
        </p>
        <p className="mt-1 text-[12px] text-omniv-text-muted">
          Softest scores first. Command ranks the week; Analytics only shows if
          you are falling back or moving forward.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link href="/dashboard">
            <Button size="sm" className="h-7 text-[11px]">
              Command
            </Button>
          </Link>
          <Link href="/ziki">
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              Ask Ziki
            </Button>
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}
