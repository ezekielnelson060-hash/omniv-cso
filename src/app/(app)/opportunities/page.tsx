"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { buildRecommendationsFromBrain } from "@/lib/strategy/scores";
import type { AIRecommendation } from "@/types";
import { Loader2 } from "lucide-react";

export default function OpportunitiesPage() {
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
        if (!cancelled) {
          setRecs(buildRecommendationsFromBrain(b, p?.platforms || []));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Opportunity Feed
        </h1>
        <p className="mt-1 text-sm text-omniv-text-secondary">
          Ranked moves from your Artist Brain. Platform OAuth will add live
          market signals on top of this base layer.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
          Building briefings…
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
