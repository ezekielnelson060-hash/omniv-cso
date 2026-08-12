import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentScan } from "@/lib/agent/scan";
import { loadMarketProposals } from "@/lib/agent/market-news";
import { loadXMarketProposals } from "@/lib/agent/x-market";
import { buildTrendProposals } from "@/lib/agent/trend-signals";
import { rankCityBriefs } from "@/lib/strategy/city-demand";
import type { ArtistBrain, CatalogueRelease, CatalogueTrack } from "@/types";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, platforms, interests, social_links")
      .eq("id", user.id)
      .maybeSingle();

    let brain: ArtistBrain | null = null;
    try {
      const { data: brainRow } = await supabase
        .from("artist_brains")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (brainRow) {
        brain = {
          name: (brainRow.name as string) || profile?.full_name || "Artist",
          stageName: (brainRow.stage_name as string) || undefined,
          genre: (brainRow.genre as string[]) || [],
          musicStyle: (brainRow.music_style as string) || undefined,
          brandVoice: (brainRow.brand_voice as string) || undefined,
          careerStage: (brainRow.career_stage as string) || undefined,
          goals: (brainRow.goals as string[]) || [],
          bigDream: (brainRow.big_dream as string) || undefined,
          strengths: (brainRow.strengths as string[]) || [],
          weaknesses: (brainRow.weaknesses as string[]) || [],
          notes: (brainRow.notes as string) || undefined,
        } as ArtistBrain;
      }
    } catch {
      /* optional */
    }

    const platforms = (profile?.platforms as string[]) || [];
    const socialLinks = (profile?.social_links as Record<string, string>) || {};
    const linkedCount =
      Object.values(socialLinks).filter((u) => (u || "").trim().length > 8)
        .length || platforms.length;

    let releases: CatalogueRelease[] = [];
    let tracks: CatalogueTrack[] = [];
    try {
      const { data: rel } = await supabase
        .from("catalogue_releases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      releases = (rel || []).map((r) => ({
        id: String(r.id),
        userId: String(r.user_id),
        title: String(r.title),
        releaseType: r.release_type,
        status: r.status,
        releaseDate: r.release_date,
        primaryGenre: r.primary_genre,
        spotifyUrl: r.spotify_url,
        youtubeUrl: r.youtube_url,
      }));
    } catch {
      /* optional */
    }
    try {
      const { data: tr } = await supabase
        .from("catalogue_tracks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      tracks = (tr || []).map((r) => {
        let analysis = null;
        if (r.notes && String(r.notes).startsWith("{")) {
          try {
            analysis = JSON.parse(String(r.notes)).analysis;
          } catch {
            analysis = null;
          }
        }
        return {
          id: String(r.id),
          userId: String(r.user_id),
          title: String(r.title),
          durationSec: r.duration_sec,
          audioPath: r.audio_path,
          analysis,
        };
      });
    } catch {
      /* optional */
    }

    let fanCities: { city: string; count: number; wouldAttend?: number }[] =
      [];
    let fanCount = 0;
    function rollupFans(
      list: { city?: string | null; would_attend?: boolean | null }[]
    ) {
      fanCount = list.length;
      const map = new Map<string, { count: number; ready: number }>();
      for (const f of list) {
        const c = String(f.city || "").trim();
        if (!c) continue;
        const cur = map.get(c) || { count: 0, ready: 0 };
        cur.count += 1;
        if (f.would_attend) cur.ready += 1;
        map.set(c, cur);
      }
      fanCities = [...map.entries()]
        .map(([city, v]) => ({
          city,
          count: v.count,
          wouldAttend: v.ready,
        }))
        .sort((a, b) => b.count - a.count);
    }
    try {
      const { data: roster } = await supabase
        .from("roster_artists")
        .select("id")
        .or(`user_id.eq.${user.id},owner_user_id.eq.${user.id}`);
      const ids = (roster || []).map((r) => r.id as string);
      if (ids.length) {
        const { data: fans } = await supabase
          .from("fans")
          .select("city, would_attend")
          .in("artist_id", ids);
        rollupFans(fans || []);
      }
    } catch {
      /* soft */
    }

    if (fanCount === 0) {
      try {
        const { data: fans } = await supabase
          .from("fans")
          .select("city, would_attend")
          .eq("user_id", user.id)
          .limit(800);
        rollupFans(fans || []);
      } catch {
        /* soft */
      }
    }

    let hasPayout = false;
    try {
      const { data: pay } = await supabase
        .from("profiles")
        .select("payout_subaccount_id")
        .eq("id", user.id)
        .maybeSingle();
      hasPayout = Boolean(pay?.payout_subaccount_id);
    } catch {
      /* soft */
    }

    let hasTipReady = false;
    try {
      const { count } = await supabase
        .from("roster_artists")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      hasTipReady = (count || 0) > 0;
    } catch {
      /* soft */
    }

    const result = runAgentScan({
      brain: brain
        ? {
            ...brain,
            name: brain.name || profile?.full_name || "Artist",
          }
        : null,
      releases,
      tracks,
      platforms,
      linkedSurfaces: linkedCount,
      fanCities,
      fanCount,
      hasPayout,
      hasTipReady,
      interests: (profile?.interests as string[]) || [],
    });

    const metricSignals: typeof result.proposals = [];
    try {
      const { data: metrics } = await supabase
        .from("platform_metrics")
        .select(
          "title, popularity, followers, entity_type, entity_url, fetched_at, platform"
        )
        .eq("user_id", user.id)
        .order("fetched_at", { ascending: false })
        .limit(12);
      const now = Date.now();
      for (const m of metrics || []) {
        const pop = Number(m.popularity ?? 0);
        if (!Number.isFinite(pop) || pop <= 0) continue;
        const title = String(m.title || "Your release");
        const id = `metric-${String(m.platform || "spotify")}-${title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 32)}`;
        metricSignals.push({
          id,
          title:
            pop >= 40
              ? `Popularity ${pop} on ${title.slice(0, 36)}`
              : `Spotify score ${pop} · ${title.slice(0, 36)}`,
          body:
            pop >= 40
              ? "Outside signal: score is moving. Put tip link in bio, lock release date, or pitch one playlist that fits."
              : "Outside signal: public popularity snapshot. Paste more DSP links in Catalogue so this updates weekly.",
          urgency: pop >= 50 ? "today" : "this_week",
          impact: pop >= 40 ? "high" : "medium",
          source: "webhook",
          action: {
            type: pop >= 40 ? "OPEN_CRM" : "OPEN_CATALOGUE",
            label: pop >= 40 ? "Open Money · tip link" : "Open Catalogue",
            payload: pop >= 40 ? { focus: "money" } : { phase: "links" },
          },
          status: "pending",
          createdAt: now,
        });
      }
    } catch {
      /* table may be empty */
    }

    let marketSignals: typeof result.proposals = [];
    let xSignals: typeof result.proposals = [];
    try {
      marketSignals = await loadMarketProposals(5);
    } catch {
      /* NewsAPI optional */
    }
    try {
      xSignals = await loadXMarketProposals();
    } catch {
      /* X optional */
    }

    const trendSignals = buildTrendProposals({
      brain,
      platforms,
      hasAudio: tracks.length > 0 || releases.length > 0,
    });

    const cityBriefs = rankCityBriefs(fanCities, 3);
    const nowCity = Date.now();
    const cityDemandSignals = cityBriefs.map((b, i) => ({
      id: `city-${b.city
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 24)}`,
      title: b.city,
      body: b.line,
      urgency: i === 0 ? ("today" as const) : ("this_week" as const),
      impact: b.addressable >= 15 ? ("high" as const) : ("medium" as const),
      source: "webhook" as const,
      action: {
        type: "OPEN_CRM" as const,
        label: `Open room · ${b.city}`,
        payload: {
          focus: "rooms",
          city: b.city,
          capacity: b.recommendedCap,
          ticketUsd: b.optimalTicketUsd,
        },
      },
      status: "pending" as const,
      createdAt: nowCity - i * 500,
    }));

    const proposalsOut = [
      ...cityDemandSignals.slice(0, 3),
      ...xSignals.slice(0, 3),
      ...marketSignals.slice(0, 3),
      ...metricSignals.slice(0, 2),
      ...trendSignals.slice(0, 2),
      ...result.proposals,
    ].slice(0, 16);

    try {
      const { data: prev } = await supabase
        .from("profiles")
        .select("agent_inbox")
        .eq("id", user.id)
        .maybeSingle();
      const prevInbox = (prev?.agent_inbox || {}) as {
        proposals?: {
          id: string;
          status?: string;
          createdAt?: number;
          source?: string;
        }[];
      };
      const preserved = (prevInbox.proposals || []).filter((x) => {
        if (!x?.id) return false;
        if (x.status === "done" || x.status === "dismissed") return true;
        if (x.status !== "pending") return false;
        const id = String(x.id);
        return (
          id.startsWith("webhook-") ||
          id.startsWith("wh-") ||
          id.startsWith("metric-") ||
          id.startsWith("market-") ||
          id.startsWith("x-") ||
          id.startsWith("trend-") ||
          id.startsWith("city-") ||
          x.source === "webhook"
        );
      });
      const byId = new Map<string, (typeof proposalsOut)[0]>();
      for (const x of preserved)
        byId.set(x.id, x as (typeof proposalsOut)[0]);
      for (const x of proposalsOut) byId.set(x.id, x);
      const merged = Array.from(byId.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      await supabase
        .from("profiles")
        .update({
          agent_inbox: {
            proposals: merged.slice(0, 40),
            scannedAt: result.scannedAt,
            narrative: result.narrative,
          },
          agent_scanned_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch {
      /* optional columns */
    }

    return NextResponse.json({
      ...result,
      proposals: proposalsOut,
      signals:
        metricSignals.length +
        marketSignals.length +
        xSignals.length +
        trendSignals.length +
        cityDemandSignals.length,
      market: marketSignals.length,
      x: xSignals.length,
      trends: trendSignals.length,
      cities: cityDemandSignals.length,
    });
  } catch (e) {
    console.error("agent scan", e);
    return NextResponse.json(
      { error: "scan_failed", proposals: [], narrative: "" },
      { status: 500 }
    );
  }
}
