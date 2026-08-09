import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type ResearchStep = {
  id: string;
  label: string;
  status: "done" | "active" | "pending" | "warn";
  detail?: string;
};

/**
 * POST /api/activate/research
 * Real career research for the signed-in artist — not theatre-only.
 * Returns ordered steps + findings for the Explee-style activate console.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sb =
      url && service
        ? createAdmin(url, service, { auth: { persistSession: false } })
        : supabase;

    const steps: ResearchStep[] = [];
    const findings: string[] = [];

    steps.push({
      id: "profile",
      label: "fetching your Omniv profile…",
      status: "active",
    });
    const { data: profile } = await sb
      .from("profiles")
      .select(
        "full_name, role, platforms, social_links, interests, agent_inbox, onboarding_complete"
      )
      .eq("id", user.id)
      .maybeSingle();

    const platforms = (profile?.platforms as string[]) || [];
    const links = (profile?.social_links as Record<string, string>) || {};
    const linked = Object.entries(links).filter(
      ([, v]) => (v || "").trim().length > 8
    );
    steps[0] = {
      id: "profile",
      label: "fetching your Omniv profile…",
      status: "done",
      detail: profile?.full_name
        ? `Found ${profile.full_name}`
        : "Profile row ready",
    };
    if (profile?.full_name) findings.push(`Artist: ${profile.full_name}`);
    if (platforms.length)
      findings.push(`Platforms marked: ${platforms.join(", ")}`);
    if (linked.length)
      findings.push(`${linked.length} DSP/social URL(s) linked`);

    steps.push({
      id: "brain",
      label: "reading Artist Brain…",
      status: "active",
    });
    const { data: brain } = await sb
      .from("artist_brains")
      .select(
        "name, stage_name, genre, music_style, brand_voice, career_stage, big_dream, goals, strengths"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const genres = (brain?.genre as string[]) || [];
    const dream = (brain?.big_dream as string) || "";
    const goals = (brain?.goals as string[]) || [];
    steps[1] = {
      id: "brain",
      label: "reading Artist Brain…",
      status: brain ? "done" : "warn",
      detail: brain
        ? `${brain.stage_name || brain.name || "Artist"} · ${brain.career_stage || "stage n/a"}`
        : "Brain empty — fill Artist Brain next",
    };
    if (genres.length) findings.push(`Genre: ${genres.join(", ")}`);
    if (dream) findings.push(`Big Dream: ${dream.slice(0, 120)}`);
    if (goals.length)
      findings.push(`Goals: ${goals.slice(0, 3).join("; ")}`);

    steps.push({
      id: "catalogue",
      label: "scanning catalogue (tracks + releases)…",
      status: "active",
    });
    const [{ count: trackCount }, { count: releaseCount }, { data: releases }] =
      await Promise.all([
        sb
          .from("catalogue_tracks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        sb
          .from("catalogue_releases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        sb
          .from("catalogue_releases")
          .select("title, status, spotify_url")
          .eq("user_id", user.id)
          .limit(5),
      ]);
    const tracks = trackCount || 0;
    const rels = releaseCount || 0;
    const withSpotify = (releases || []).filter((r) =>
      (r.spotify_url || "").trim()
    ).length;
    steps[2] = {
      id: "catalogue",
      label: "scanning catalogue (tracks + releases)…",
      status: tracks || rels ? "done" : "warn",
      detail: `${tracks} track(s) · ${rels} release(s)${withSpotify ? ` · ${withSpotify} DSP-linked` : ""}`,
    };
    findings.push(
      tracks || rels
        ? `Catalogue: ${tracks} analysed track(s), ${rels} release(s)`
        : "Catalogue empty — upload a song or add a release"
    );

    steps.push({
      id: "audience",
      label: "checking owned fans + DSP snapshots…",
      status: "active",
    });
    const [{ count: fanCount }, { data: metrics }] = await Promise.all([
      sb
        .from("fans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      sb
        .from("platform_metrics")
        .select("popularity, platform, title")
        .eq("user_id", user.id)
        .limit(20),
    ]);
    const fans = fanCount || 0;
    const pops = (metrics || [])
      .map((m) => m.popularity)
      .filter((n): n is number => typeof n === "number");
    const avgPop =
      pops.length > 0
        ? Math.round(pops.reduce((a, b) => a + b, 0) / pops.length)
        : null;
    steps[3] = {
      id: "audience",
      label: "checking owned fans + DSP snapshots…",
      status: fans || pops.length ? "done" : "warn",
      detail:
        fans || pops.length
          ? `${fans} fan(s)${avgPop != null ? ` · DSP pop ~${avgPop}` : ""}`
          : "No fans or DSP rows yet",
    };
    if (fans) findings.push(`Owned fans: ${fans}`);
    if (avgPop != null) findings.push(`Avg DSP popularity: ${avgPop}`);

    steps.push({
      id: "agent",
      label: "ranking Agent proposals…",
      status: "active",
    });
    const inbox = (profile?.agent_inbox || {}) as {
      proposals?: { status?: string; title?: string }[];
    };
    const pending = (inbox.proposals || []).filter(
      (p) => !p.status || p.status === "pending"
    );
    steps[4] = {
      id: "agent",
      label: "ranking Agent proposals…",
      status: "done",
      detail:
        pending.length > 0
          ? `${pending.length} pending confirm(s)`
          : "Inbox clear — scan after catalogue/Settings",
    };
    if (pending[0]?.title)
      findings.push(`Top Agent: ${pending[0].title}`);

    const gaps: string[] = [];
    if (!brain) gaps.push("Fill Artist Brain");
    if (!tracks && !rels) gaps.push("Upload catalogue");
    if (!linked.length) gaps.push("Link Spotify / socials in Settings");
    if (!fans) gaps.push("Open Fan Gate");

    let nextMove =
      pending[0]?.title ||
      (tracks && !rels
        ? "Lock a release date (or Hold) for your analysed track"
        : null) ||
      (gaps[0] ? gaps[0] : "Open Opportunities — confirm the #1 card");

    steps.push({
      id: "seal",
      label: "sealing operating brief…",
      status: "done",
      detail: nextMove,
    });

    const summary = {
      artistName:
        (brain?.stage_name as string) ||
        (brain?.name as string) ||
        (profile?.full_name as string) ||
        "your project",
      careerStage: (brain?.career_stage as string) || null,
      bigDream: dream || null,
      tracks,
      releases: rels,
      fans,
      avgPopularity: avgPop,
      pendingAgent: pending.length,
      gaps,
      nextMove,
      findings,
    };

    return NextResponse.json({ ok: true, steps, summary });
  } catch (e) {
    console.error("activate research", e);
    return NextResponse.json({ error: "research_failed" }, { status: 500 });
  }
}
