import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { metricsFromSpotifyUrl } from "@/lib/spotify/metrics";

/**
 * Pull public Spotify popularity for catalogue releases with Spotify URLs.
 * Vercel Cron: GET /api/cron/platform-metrics
 * Header: Authorization: Bearer <CRON_SECRET>
 *
 * Honest scope: popularity + followers (Web API). Not full S4A stream charts.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json(
      { error: "Missing Supabase service role" },
      { status: 500 }
    );
  }

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID/SECRET not configured", skipped: true },
      { status: 503 }
    );
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false },
  });

  const { data: releases, error } = await admin
    .from("catalogue_releases")
    .select("id, user_id, title, spotify_url")
    .not("spotify_url", "is", null)
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const r of releases || []) {
    const spotifyUrl = (r.spotify_url || "").trim();
    if (!spotifyUrl || !r.user_id) {
      skipped++;
      continue;
    }
    try {
      const m = await metricsFromSpotifyUrl(spotifyUrl);
      if (!m) {
        skipped++;
        continue;
      }
      const { error: upErr } = await admin.from("platform_metrics").upsert(
        {
          user_id: r.user_id,
          platform: "spotify",
          entity_type: m.entityType,
          entity_id: m.entityId,
          entity_url: m.externalUrl,
          title: m.title || r.title,
          popularity: m.popularity,
          followers: m.followers ?? null,
          extra: {
            ...m.extra,
            catalogue_release_id: r.id,
          },
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform,entity_type,entity_id" }
      );
      if (upErr) {
        console.error("platform_metrics upsert", upErr.message);
        failed++;
      } else {
        updated++;
      }
    } catch (e) {
      console.error("platform-metrics row", e);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: (releases || []).length,
    updated,
    failed,
    skipped,
    note: "Public popularity only — not Spotify for Artists full charts",
  });
}
