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
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
        if (!cancelled) {
          const interests = p?.interests || [];
          setRecs(
            buildRecommendationsFromBrain(b, p?.platforms || [], interests)
          );
          const name = b?.stageName || b?.name || p?.full_name || "you";
          const genre = b?.genre?.filter((g) => g !== "TBD").join(" / ");
          setSubtitle(
            genre
              ? `Ranked for ${name} · ${genre}${interests.length ? ` · focus: ${interests.join(", ")}` : ""}`
              : `Ranked from your Artist Brain, not a public tip list`
          );
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
          Opportunity intelligence
        </h1>
        <p className="mt-1 text-sm text-omniv-text-secondary">{subtitle}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
          Ranking moves…
        </div>
      ) : recs.length === 0 ? (
        <p className="text-sm text-omniv-text-muted">
          Seal onboarding so opportunities match your goals, not generic lists.
        </p>
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
