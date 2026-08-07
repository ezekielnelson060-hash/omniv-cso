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
              : `We ranked from your brain, not a public tip list`
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
      <div className="mb-3">
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Ranked
        </p>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Opportunities
        </h1>
        <p className="mt-0.5 text-[11px] text-omniv-text-muted">{subtitle}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
          Ranking your week…
        </div>
      ) : recs.length === 0 ? (
        <p className="text-xs text-omniv-text-muted">
          Finish onboarding. We cannot rank an empty profile.
        </p>
      ) : (
        <div className="space-y-2">
          {recs.map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
