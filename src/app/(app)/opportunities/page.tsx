"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { buildRecommendationsFromBrain } from "@/lib/strategy/scores";
import { completedIds } from "@/lib/opportunity-progress";
import type { AIRecommendation } from "@/types";
import { Loader2 } from "lucide-react";

export default function OpportunitiesPage() {
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [doneRecs, setDoneRecs] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtitle, setSubtitle] = useState("");

  const reload = useCallback(async () => {
    const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
    const interests = p?.interests || [];
    const platforms = p?.platforms || [];
    const done = completedIds();
    const all = buildRecommendationsFromBrain(b, platforms, interests, []);
    const active = buildRecommendationsFromBrain(b, platforms, interests, done);
    const doneSet = new Set(done);
    setRecs(active);
    setDoneRecs(all.filter((r) => doneSet.has(r.id)));
    const name = b?.stageName || b?.name || p?.full_name || "you";
    const genre = b?.genre?.filter((g) => g !== "TBD").join(" / ");
    const dream = b?.bigDream?.trim() || b?.goals?.[0] || "";
    setSubtitle(
      dream
        ? `Ranked for ${name}${genre ? ` · ${genre}` : ""} against “${dream.slice(0, 60)}${dream.length > 60 ? "…" : "”"}`
        : genre
          ? `Ranked for ${name} · ${genre}`
          : "Finish Artist Brain so ranking stops being generic"
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const onProg = () => {
      void reload();
    };
    window.addEventListener("omniv-opp-progress", onProg);
    window.addEventListener("storage", onProg);
    return () => {
      cancelled = true;
      window.removeEventListener("omniv-opp-progress", onProg);
      window.removeEventListener("storage", onProg);
    };
  }, [reload]);

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
        <p className="mt-1 text-[10px] text-omniv-text-muted">
          Confidence % = how complete your brain + platforms are for that call —
          not a market guarantee. Mark done when you execute; ranking updates.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
          Ranking your week…
        </div>
      ) : recs.length === 0 && doneRecs.length === 0 ? (
        <p className="text-xs text-omniv-text-muted">
          Finish onboarding and Artist Brain. We cannot rank an empty profile.
        </p>
      ) : (
        <div className="space-y-2">
          {recs.map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
          {doneRecs.length > 0 && (
            <div className="pt-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                Done this cycle · reopen if still active
              </p>
              {doneRecs.map((r, i) => (
                <RecommendationCard
                  key={`done-${r.id}`}
                  recommendation={{ ...r, priority: i + 1 }}
                  index={99}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
