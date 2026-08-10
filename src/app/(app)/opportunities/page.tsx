"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { buildRecommendationsFromBrain } from "@/lib/strategy/scores";
import { completedIds } from "@/lib/opportunity-progress";
import { listCatalogueReleases } from "@/lib/catalogue/db";
import { listCatalogueTracks } from "@/lib/catalogue/tracks";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AIRecommendation } from "@/types";
import { Loader2 } from "lucide-react";

export default function OpportunitiesPage() {
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [doneRecs, setDoneRecs] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtitle, setSubtitle] = useState("");

  const reload = useCallback(async () => {
    const [b, p, releases, tracks] = await Promise.all([
      getArtistBrain(),
      getProfile(),
      listCatalogueReleases(),
      listCatalogueTracks(),
    ]);
    const interests = p?.interests || [];
    const platforms = p?.platforms || [];
    const links = Object.values(p?.social_links || {}).filter(
      (u) => (u || "").trim().length > 8
    ).length;
    const linkedSurfaces = Math.max(links, platforms.length);
    let fanCount = 0;
    let fans7d = 0;
    let avgPopularity = 0;
    let metricsCount = 0;
    if (isSupabaseConfigured()) {
      try {
        const sb = createClient();
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (user) {
          const { count } = await sb
            .from("fans")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id);
          fanCount = count || 0;
          const weekAgo = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString();
          const { count: c7 } = await sb
            .from("fans")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", weekAgo);
          fans7d = c7 || 0;

          const { data: metrics } = await sb
            .from("platform_metrics")
            .select("popularity, platform, entity_type")
            .eq("user_id", user.id)
            .order("fetched_at", { ascending: false })
            .limit(40);
          if (metrics?.length) {
            metricsCount = metrics.length;
            const pops = metrics
              .map((m) => m.popularity)
              .filter((n): n is number => typeof n === "number");
            if (pops.length) {
              avgPopularity = Math.round(
                pops.reduce((a, b) => a + b, 0) / pops.length
              );
            }
          }
        }
      } catch {
        /* optional */
      }
    }
    const trackCount = tracks.filter((t) => t.audioPath || t.analysis).length;
    const releaseCount = releases.length;
    const unreleasedCount = tracks.filter(
      (t) =>
        (t.audioPath || t.analysis) &&
        !(releases || []).some(
          (r) =>
            r.title &&
            t.title &&
            r.title.toLowerCase().includes(t.title.toLowerCase().slice(0, 12))
        )
    ).length;
    const done = completedIds();
    const cat = { releases, tracks };
    const live = {
      linkedSurfaces,
      fanCount,
      fans7d,
      trackCount,
      releaseCount,
      unreleasedCount,
      avgPopularity,
      metricsCount,
    };
    const all = buildRecommendationsFromBrain(
      b,
      platforms,
      interests,
      [],
      cat,
      live
    );
    const active = buildRecommendationsFromBrain(
      b,
      platforms,
      interests,
      done,
      cat,
      live
    );
    const doneSet = new Set(done);
    setRecs(active);
    setDoneRecs(all.filter((r) => doneSet.has(r.id)));
    const name = b?.stageName || b?.name || p?.full_name || "you";
    const genre = b?.genre?.filter((g) => g !== "TBD").join(" / ");
    const dream = b?.bigDream?.trim() || b?.goals?.[0] || "";
    const invParts = [
      trackCount ? `${trackCount} track(s)` : null,
      releaseCount ? `${releaseCount} release(s)` : null,
      fanCount ? `${fanCount} fans` : null,
      linkedSurfaces ? `${linkedSurfaces} surface(s)` : null,
      metricsCount
        ? `DSP pop ${avgPopularity}${metricsCount > 1 ? ` · ${metricsCount} snaps` : ""}`
        : null,
    ].filter(Boolean);
    const inv = invParts.length ? ` · ${invParts.join(", ")}` : "";
    setSubtitle(
      dream
        ? `Ranked for ${name}${genre ? ` · ${genre}` : ""}${inv} against “${dream.slice(0, 50)}${dream.length > 50 ? "…" : "”"}`
        : genre
          ? `Ranked for ${name} · ${genre}${inv}`
          : "Finish Artist Brain + upload a track so ranking stops being generic"
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
      <div className="relative -mx-3 mb-4 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-omniv-gold/12 via-transparent to-transparent" />
        <div className="relative px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            Ranked
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Moves
          </h1>
          <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
            {subtitle ||
              "Next confirmable actions from your brain, catalogue, fans, and DSP."}
          </p>
          <p className="mt-1.5 text-[11px] text-omniv-text-muted">
            Confidence = completeness of inputs — not a market guarantee. Mark
            done when you execute.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
          Ranking your week…
        </div>
      ) : recs.length === 0 && doneRecs.length === 0 ? (
        <p className="text-xs text-omniv-text-muted">
          Finish onboarding, Artist Brain, or upload a track in Catalogue.
        </p>
      ) : (
        <div className="space-y-2">
          {recs.map((r, i) => (
            <RecommendationCard
              key={r.id}
              recommendation={r}
              index={i}
              defaultOpen={i === 0}
            />
          ))}
          {doneRecs.length > 0 && (
            <div className="pt-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                Done this cycle
              </p>
              {doneRecs.map((r, i) => (
                <RecommendationCard
                  key={`done-${r.id}`}
                  recommendation={r}
                  index={i + 100}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
