import { NextResponse } from "next/server";
import { createClient as createService } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createService(url, key);
}

type Payload = {
  overall?: number;
  reach?: number;
  momentum?: number;
  revenue?: number;
  signals?: {
    spotifyPopularity?: number | null;
    spotifyFollowers?: number | null;
    genres?: string | null;
  };
  thumbnail?: string | null;
};

function peakScore(row: {
  overall_score: number;
  created_at: string;
  payload?: Payload | null;
}) {
  const p = row.payload || {};
  const sig = p.signals || {};
  const pop = Number(sig.spotifyPopularity ?? 0);
  const followers = Number(sig.spotifyFollowers ?? 0);
  const momentum = Number(p.momentum ?? row.overall_score);
  const ageDays =
    (Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const platform =
    pop > 0
      ? pop * 0.55 +
        Math.min(40, Math.log10(Math.max(10, followers)) * 8)
      : 0;
  const recency = Math.max(0, 30 - ageDays);
  const base =
    row.overall_score * 0.45 +
    momentum * 0.25 +
    platform * 0.2 +
    recency * 0.5;
  return Math.round(base);
}

export async function GET() {
  try {
    const svc = service();
    if (!svc) {
      return NextResponse.json({ audits: [], cities: [], roster: [] });
    }

    const { data: audits } = await svc
      .from("public_audits")
      .select(
        "id, share_slug, source_type, artist_name, headline, overall_score, payload, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(80);

    const enriched = (audits || []).map((a) => {
      const payload = (a.payload || {}) as Payload;
      const sig = payload.signals || {};
      const peak = peakScore({
        overall_score: a.overall_score,
        created_at: a.created_at,
        payload,
      });
      return {
        id: a.id,
        share_slug: a.share_slug,
        source_type: a.source_type,
        artist_name: a.artist_name,
        headline: a.headline,
        overall_score: a.overall_score,
        created_at: a.created_at,
        peak_score: peak,
        spotify_popularity: sig.spotifyPopularity ?? null,
        spotify_followers: sig.spotifyFollowers ?? null,
        genres: sig.genres ?? null,
        momentum: payload.momentum ?? null,
        reach: payload.reach ?? null,
        thumbnail: payload.thumbnail ?? null,
      };
    });

    enriched.sort((a, b) => b.peak_score - a.peak_score);

    const { data: fans } = await svc
      .from("fans")
      .select("city, would_attend")
      .not("city", "is", null)
      .limit(5000);

    const map = new Map<string, { fans: number; ready: number }>();
    for (const f of fans || []) {
      const city = String(f.city || "").trim();
      if (!city) continue;
      const cur = map.get(city) || { fans: 0, ready: 0 };
      cur.fans += 1;
      if (f.would_attend) cur.ready += 1;
      map.set(city, cur);
    }
    const cities = [...map.entries()]
      .map(([city, v]) => ({ city, ...v }))
      .sort((a, b) => b.ready - a.ready || b.fans - a.fans)
      .slice(0, 25);

    const { data: roster } = await svc
      .from("roster_artists")
      .select("id, stage_name, slug, genre, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    return NextResponse.json({
      audits: enriched,
      cities,
      roster: roster || [],
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed",
        audits: [],
        cities: [],
        roster: [],
      },
      { status: 500 }
    );
  }
}
