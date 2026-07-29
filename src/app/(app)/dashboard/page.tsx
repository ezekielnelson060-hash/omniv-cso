"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ScoreCard } from "@/components/dashboard/score-card";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";
import {
  mockScores,
  mockRecommendations,
  mockScoreHistory,
} from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const s = mockScores;
  const topOpps = mockRecommendations.slice(0, 3);
  const overallSeries = mockScoreHistory.map((p) => p.overall);
  const socialSeries = mockScoreHistory.map((p) => p.social);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Command Center
            </h1>
            <Badge variant="gold" className="animate-soft-pulse">
              Live
            </Badge>
          </div>
          <p className="text-sm text-omniv-text-secondary">
            Highest-impact moves for the next 7 days · Strategy Engine updated
            moments ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/opportunities">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-omniv-gold" />
              Full opportunity feed
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
              Momentum is your strongest lever. Release readiness is the
              clearest upside — close that gap and overall climbs into the 80s.
            </p>
          </div>
          <div className="mt-5">
            <MiniSparkline data={overallSeries} />
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-omniv-gold transition-all duration-1000"
                style={{ width: `${s.overall}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-omniv-text-muted">
              8-week trajectory · +13 pts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
          <ScoreCard label="Growth" value={s.growth} delta={4} />
          <ScoreCard label="Momentum" value={s.momentum} delta={7} />
          <ScoreCard
            label="Audience Health"
            value={s.audienceHealth}
            delta={-1}
          />
          <ScoreCard
            label="Release Readiness"
            value={s.releaseReadiness}
            delta={2}
          />
          <ScoreCard label="Content Health" value={s.contentHealth} delta={5} />
          <ScoreCard label="Opportunity" value={s.opportunity} delta={9} />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreCard label="Fan Growth" value={s.fanGrowth} delta={6} size="sm" />
        <ScoreCard
          label="Streaming Trend"
          value={s.streamingTrend}
          delta={3}
          size="sm"
        />
        <div className="card-elevated col-span-2 flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              Social Growth
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-semibold text-omniv-gold">
                {s.socialGrowth}
              </span>
              <span className="mb-0.5 text-xs text-omniv-success">+11</span>
            </div>
          </div>
          <div className="w-28 shrink-0">
            <MiniSparkline data={socialSeries} />
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-omniv-gold/25 bg-omniv-gold/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-gold">
            Highest-impact move right now
          </p>
          <p className="mt-1 text-sm font-medium text-omniv-text">
            {topOpps[0]?.title}
          </p>
          <p className="mt-0.5 text-xs text-omniv-text-secondary">
            {topOpps[0]?.timeWindow} · {topOpps[0]?.confidence}% confidence
          </p>
        </div>
        <Link href="/opportunities">
          <Button size="sm" className="gap-1.5 whitespace-nowrap">
            Review briefing
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Executive recommendations
          </h2>
          <p className="text-sm text-omniv-text-secondary">
            Ranked by expected impact · Generated by the Strategy Engine
          </p>
        </div>
        <Link href="/opportunities">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-omniv-text-secondary"
          >
            View all {mockRecommendations.length}
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
