"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ScoreCard } from "@/components/dashboard/score-card";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import {
  computeScoresFromBrain,
  buildRecommendationsFromBrain,
  overallNarrative,
} from "@/lib/strategy/scores";
import { track } from "@/lib/analytics";
import type { ArtistBrain, ArtistScore, AIRecommendation } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scores, setScores] = useState<ArtistScore | null>(null);
  const [recs, setRecs] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
        if (cancelled) return;
        const plats = p?.platforms || [];
        setBrain(b);
        setPlatforms(plats);
        setScores(computeScoresFromBrain(b, plats));
        setRecs(buildRecommendationsFromBrain(b, plats));
        track("command_center_view", {
          has_brain: Boolean(b?.name),
          platforms: plats.length,
        });
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
        <div className="flex items-center gap-2 py-24 text-sm text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
          Opening Command Center…
        </div>
      </AppShell>
    );
  }

  const s = scores;
  const topOpps = recs.slice(0, 3);
  const spark = [
    Math.max(20, s.overall - 12),
    Math.max(22, s.overall - 8),
    Math.max(24, s.overall - 5),
    Math.max(26, s.overall - 3),
    s.overall - 1,
    s.overall,
  ];
  const socialSpark = [
    s.socialGrowth - 10,
    s.socialGrowth - 6,
    s.socialGrowth - 3,
    s.socialGrowth,
  ].map((n) => Math.max(10, n));
  const displayName = brain?.stageName || brain?.name || "Artist";

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Command Center
            </h1>
            <Badge variant="gold">{displayName}</Badge>
          </div>
          <p className="text-sm text-omniv-text-secondary">
            Private scores from your Artist Brain — the state of the career in one view
            {platforms.length
              ? ` · ${platforms.length} surface${platforms.length > 1 ? "s" : ""} in play`
              : " · add platforms to tighten precision"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/opportunities">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-omniv-gold" />
              Opportunity feed
            </Button>
          </Link>
          <Link href="/ziki">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Ask Ziki
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-12">
        <div className="glass-gold glow-gold flex flex-col justify-between rounded-[var(--radius-xl)] p-6 lg:col-span-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-omniv-gold/80">
              Overall Artist Score
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-tight text-omniv-gold">
                {s.overall}
              </span>
              <span className="mb-1.5 text-sm text-omniv-text-muted">/100</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-omniv-text-secondary">
              {overallNarrative(s, brain)}
            </p>
          </div>
          <div className="mt-5">
            <MiniSparkline data={spark} />
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-omniv-gold transition-all duration-1000"
                style={{ width: `${s.overall}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
          <ScoreCard label="Growth" value={s.growth} />
          <ScoreCard label="Momentum" value={s.momentum} />
          <ScoreCard label="Audience Health" value={s.audienceHealth} />
          <ScoreCard label="Release Readiness" value={s.releaseReadiness} />
          <ScoreCard label="Content Health" value={s.contentHealth} />
          <ScoreCard label="Opportunity" value={s.opportunity} />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreCard label="Fan Growth" value={s.fanGrowth} size="sm" />
        <ScoreCard label="Streaming Trend" value={s.streamingTrend} size="sm" />
        <div className="card-elevated col-span-2 flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              Social Growth
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-semibold text-omniv-gold">
                {s.socialGrowth}
              </span>
            </div>
          </div>
          <div className="w-28 shrink-0">
            <MiniSparkline data={socialSpark} />
          </div>
        </div>
      </div>

      {topOpps[0] && (
        <div className="mb-8 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-omniv-gold/25 bg-omniv-gold/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-gold">
              This week's non-negotiable
            </p>
            <p className="mt-1 text-sm font-medium text-omniv-text">
              {topOpps[0].title}
            </p>
            <p className="mt-0.5 text-xs text-omniv-text-secondary">
              {topOpps[0].timeWindow} · {topOpps[0].confidence}% confidence
            </p>
          </div>
          <Link href="/opportunities">
            <Button size="sm" className="gap-1.5 whitespace-nowrap">
              Open the move
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Ranked intelligence
          </h2>
          <p className="text-sm text-omniv-text-secondary">
            From your Artist Brain only — not generic industry tips
          </p>
        </div>
        <Link href="/opportunities">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-omniv-text-secondary"
          >
            View all {recs.length}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {topOpps.map((r, i) => (
          <RecommendationCard key={r.id} recommendation={r} index={i} />
        ))}
      </div>
    </AppShell>
  );
}
