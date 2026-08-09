import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runAgentScan } from "@/lib/agent/scan";
import type { AgentProposal } from "@/lib/agent/types";
import type { ArtistBrain, CatalogueRelease, CatalogueTrack } from "@/types";

/**
 * Daily autonomous agent scan for all profiles.
 * Vercel Cron: GET /api/cron/agent-scan
 * Header: Authorization: Bearer <CRON_SECRET>
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

  const admin = createClient(url, service, {
    auth: { persistSession: false },
  });

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, full_name, platforms, social_links, agent_inbox")
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let scanned = 0;
  let failed = 0;

  for (const p of profiles || []) {
    try {
      let brain: ArtistBrain | null = null;
      try {
        const { data: brainRow } = await admin
          .from("artist_brains")
          .select("*")
          .eq("user_id", p.id)
          .maybeSingle();
        if (brainRow) {
          brain = {
            name: (brainRow.name as string) || p.full_name || "Artist",
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

      let releases: CatalogueRelease[] = [];
      let tracks: CatalogueTrack[] = [];

      const { data: rel } = await admin
        .from("catalogue_releases")
        .select("*")
        .eq("user_id", p.id)
        .limit(20);
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

      const { data: tr } = await admin
        .from("catalogue_tracks")
        .select("*")
        .eq("user_id", p.id)
        .limit(20);
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

      const fanCities: { city: string; count: number }[] = [];
      const { data: fans } = await admin
        .from("fans")
        .select("city")
        .eq("user_id", p.id)
        .limit(400);
      const map = new Map<string, number>();
      for (const f of fans || []) {
        const c = (f.city || "").trim();
        if (!c) continue;
        map.set(c, (map.get(c) || 0) + 1);
      }
      for (const [city, count] of map) fanCities.push({ city, count });

      const platforms = (p.platforms as string[]) || [];
      const socialLinks = (p.social_links as Record<string, string>) || {};
      const linkedCount =
        Object.values(socialLinks).filter((u) => (u || "").trim().length > 8)
          .length || platforms.length;

      const result = runAgentScan({
        brain: brain
          ? { ...brain, name: brain.name || p.full_name || "Artist" }
          : null,
        releases,
        tracks,
        platforms,
        linkedSurfaces: linkedCount,
        fanCities,
      });

      const prevInbox = (p.agent_inbox || {}) as {
        proposals?: AgentProposal[];
      };
      const livePending = (prevInbox.proposals || []).filter(
        (x) =>
          x.status === "pending" &&
          typeof x.id === "string" &&
          (x.id.startsWith("room-") || x.id.startsWith("webhook-"))
      );
      const byId = new Map<string, AgentProposal>();
      for (const x of result.proposals) byId.set(x.id, x);
      for (const x of livePending) {
        if (!byId.has(x.id)) byId.set(x.id, x);
      }
      const merged = Array.from(byId.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );

      await admin
        .from("profiles")
        .update({
          agent_inbox: {
            narrative: result.narrative,
            scannedAt: result.scannedAt,
            proposals: merged.slice(0, 40),
          },
          agent_scanned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", p.id);

      scanned++;
    } catch (e) {
      console.warn("agent-scan user", p.id, e);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned,
    failed,
    total: (profiles || []).length,
  });
}
