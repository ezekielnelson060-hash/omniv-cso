"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { mockRecommendations } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter, Sparkles } from "lucide-react";

const FILTERS = [
  "All",
  "Trend",
  "Release",
  "Audience",
  "Playlist",
  "Collab",
  "Festival",
  "Platform",
  "Market",
  "Content",
] as const;

type Filter = (typeof FILTERS)[number];

export default function OpportunitiesPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [impactOnly, setImpactOnly] = useState(false);

  const items = useMemo(() => {
    return mockRecommendations
      .filter((r) => (filter === "All" ? true : r.category === filter))
      .filter((r) => (impactOnly ? r.impact === "High" : true))
      .sort((a, b) => a.priority - b.priority);
  }, [filter, impactOnly]);

  const highCount = mockRecommendations.filter((r) => r.impact === "High").length;

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Opportunity Feed
            </h1>
            <Badge variant="gold">
              <Sparkles className="mr-1 h-3 w-3" />
              {mockRecommendations.length} live
            </Badge>
          </div>
          <p className="max-w-xl text-sm text-omniv-text-secondary">
            Continuous detection across trends, playlists, audience, collabs and
            markets. Every card is an executive briefing — not a generic tip.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-omniv-text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-omniv-border bg-omniv-card px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-omniv-success animate-soft-pulse" />
            Engine scanning
          </span>
          <span>{highCount} high-impact</span>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-omniv-text-muted">
          <Filter className="h-3.5 w-3.5" />
          Filter by category
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-all",
                filter === f
                  ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
                  : "border-omniv-border bg-omniv-card text-omniv-text-secondary hover:border-omniv-border-subtle hover:text-omniv-text"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <Button
            variant={impactOnly ? "primary" : "outline"}
            size="sm"
            onClick={() => setImpactOnly((v) => !v)}
          >
            High impact only
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-omniv-border bg-omniv-card/50 py-20 text-center">
          <Sparkles className="mb-3 h-8 w-8 text-omniv-text-muted" />
          <p className="text-sm font-medium text-omniv-text">
            No opportunities in this filter
          </p>
          <p className="mt-1 max-w-sm text-xs text-omniv-text-muted">
            The Strategy Engine keeps scanning. Try another category or clear
            filters.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setFilter("All");
              setImpactOnly(false);
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
