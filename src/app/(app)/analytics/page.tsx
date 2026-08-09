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
import { listCatalogueReleases } from "@/lib/catalogue/db";
import { listCatalogueTracks } from "@/lib/catalogue/tracks";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ArtistScore } from "@/types";
import { BarChart3, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricKey =
  | "overall"
  | "growth"
  | "momentum"
  | "content"
  | "readiness";

type Signals = {
  links: number;
  fans: number;
  fans7d: number;
  tracks: number;
  releases: number;
  unreleased: number;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ArtistScore | null>(null);
  const [name, setName] = useState("you");
  const [dream, setDream] = useState("Your Big Dream");
  const [metric, setMetric] = useState<MetricKey>("overall");
  const [narrative, setNarrative] = useState("");
  const [momentumRead, setMomentumRead] = useState("");
  const [signals, setSignals] = useState<Signals>({
    links: 0,
    fans: 0,
    fans7d: 0,
    tracks: 0,
    releases: 0,
    unreleased: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p, releases, tracks] = await Promise.all([
          getArtistBrain(),
          getProfile(),
          listCatalogueReleases(),
          listCatalogueTracks(),
        ]);
        if (cancelled) return;

        const links = Object.values(p?.social_links || {}).filter(
          (u) => (u || "").trim().length > 8
        ).length;
        const platforms = p?.platforms || [];
        const linkedSurfaces = Math.max(links, platforms.length);

        let fans = 0;
        let fans7d = 0;
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
              fans = count || 0;
              const weekAgo = new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString();
              const { count: c7 } = await sb
                .from("fans")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gte("created_at", weekAgo);
              fans7d = c7 || 0;
            }
          } catch {
            /* optional */
          }
        }

        const trackCount = tracks.filter(
          (t) => t.audioPath || t.analysis
        ).length;
        const releaseCount = releases.length;
        const unreleasedCount = releases.filter(
          (r) =>
            r.status === "draft" ||
            r.status === "idea" ||
            r.status === "scheduled"
        ).length;

        const sig: Signals = {
          links: linkedSurfaces,
          fans,
          fans7d,
          tracks: trackCount,
          releases: releaseCount,
          unreleased: unreleasedCount,
        };
        setSignals(sig);

        const s = computeScoresFromBrain(b, {
          platforms,
          interests: p?.interests || [],
          linkedSurfaces,
          fanCount: fans,
          fans7d,
          trackCount,
          releaseCount,
          unreleasedCount,
        });
        setScores(s);
        setName(b?.stageName || b?.name || p?.full_name || "you");
        setDream(
          b?.bigDream || b?.goals?.[0] || "Name the dream in Artist Brain"
        );
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

  const realBits = [
    signals.links > 0 ? `${signals.links} linked surface(s)` : null,
    signals.fans > 0 ? `${signals.fans} fans` : null,
    signals.fans7d > 0 ? `+${signals.fans7d} / 7d` : null,
    signals.tracks > 0 ? `${signals.tracks} analysed track(s)` : null,
    signals.releases > 0 ? `${signals.releases} release(s)` : null,
  ].filter(Boolean);

  return (
    <AppShell>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
            Progress
          </p>
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight md:text-xl">
            <BarChart3 className="h-5 w-5 text-omniv-gold" />
            Analytics
          </h1>
          <p className="mt-0.5 max-w-lg text-[11px] text-omniv-text-muted">
            Scores update from linked surfaces, owned fans, and catalogue — not
            vanity DSP guesses.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {name}
        </Badge>
      </div>

      <Card className="mb-3 border-omniv-gold/20 bg-omniv-gold/5 p-3">
        <div className="flex flex-wrap items-start gap-2">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
              Big Dream
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-omniv-text">
              {dream}
            </p>
            <p className="mt-1 text-[10px] text-omniv-text-muted">
              {realBits.length
                ? `Live signals: ${realBits.join(" · ")}`
                : "No live signals yet — link profiles, capture fans, upload a track."}
            </p>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              Edit dream
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Links", signals.links],
          ["Fans", signals.fans],
          ["+7d", signals.fans7d],
          ["Tracks", signals.tracks],
          ["Releases", signals.releases],
          ["Unreleased", signals.unreleased],
        ].map(([label, val]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-omniv-border bg-omniv-card px-2.5 py-2"
          >
            <p className="text-[9px] uppercase tracking-wider text-omniv-text-muted">
              {label}
            </p>
            <p className="font-data text-base font-semibold tabular-nums text-omniv-text">
              {val}
            </p>
          </div>
        ))}
      </div>

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
          Softest scores first. Moves ranks the week; Analytics shows whether
          you are falling back or moving forward on real inputs.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link href="/crm">
            <Button size="sm" className="h-7 text-[11px]">
              Command
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              Moves
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
