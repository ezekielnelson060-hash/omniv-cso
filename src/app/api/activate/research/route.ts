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

/** POST /api/activate/research — real scan + one confirmable move. */
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
    let brain: Record<string, unknown> | null = null;
    {
      const full = await sb
        .from("artist_brains")
        .select(
          "name, stage_name, genre, music_style, brand_voice, career_stage, big_dream, goals, strengths"
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (full.error) {
        const soft = await sb
          .from("artist_brains")
          .select(
            "name, stage_name, genre, music_style, brand_voice, career_stage, goals, strengths"
          )
          .eq("user_id", user.id)
          .maybeSingle();
        brain = (soft.data as Record<string, unknown>) || null;
      } else {
        brain = (full.data as Record<string, unknown>) || null;
      }
    }

    const genres = (brain?.genre as string[]) || [];
    const dream = (brain?.big_dream as string) || "";
    const goals = (brain?.goals as string[]) || [];
    steps[1] = {
      id: "brain",
      label: "reading Artist Brain…",
      status: brain ? "done" : "warn",
      detail: brain
        ? `${(brain.stage_name as string) || (brain.name as string) || "Artist"} · ${(brain.career_stage as string) || "stage n/a"}`
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
    const [{ count: fanCount }, { data: metrics }, { data: fanRows }] =
      await Promise.all([
        sb
          .from("fans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        sb
          .from("platform_metrics")
          .select("popularity, platform, title")
          .eq("user_id", user.id)
          .limit(20),
        sb
          .from("fans")
          .select("city")
          .eq("user_id", user.id)
          .not("city", "is", null)
          .limit(500),
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
      proposals?: { id?: string; status?: string; title?: string }[];
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
          : "Inbox clear — scan will seed one move",
    };

    const gaps: string[] = [];
    if (!brain) gaps.push("Fill Artist Brain");
    if (!tracks && !rels) gaps.push("Upload one track");
    if (!linked.length) gaps.push("Link Spotify / socials");
    if (!fans) gaps.push("Share Fan Gate to capture emails + cities");
    if (tracks && !withSpotify) gaps.push("Paste Spotify URL on release");

    const cityMap = new Map<string, number>();
    for (const f of fanRows || []) {
      const c = String((f as { city?: string }).city || "").trim();
      if (!c) continue;
      cityMap.set(c, (cityMap.get(c) || 0) + 1);
    }
    const topCityEntry = [...cityMap.entries()].sort((a, b) => b[1] - a[1])[0];
    const topCity = topCityEntry?.[0] || null;
    const topCityCount = topCityEntry?.[1] || 0;
    const topCityReady = topCityCount;
    if (topCity) {
      findings.push(`Hot city: ${topCity} (${topCityCount} fans tagged)`);
    }

    function isStaleTitle(title: string | undefined): boolean {
      if (!title) return true;
      const t = title.toLowerCase();
      if (
        tracks > 0 &&
        /upload one track|upload catalogue|catalogue empty/.test(t)
      )
        return true;
      if (fans > 0 && /open fan gate|share your fan gate|0 fans/.test(t))
        return true;
      if (linked.length >= 2 && /add at least two|add two profile/.test(t))
        return true;
      return false;
    }

    let nextMove: string;
    if (topCity && topCityCount >= 1) {
      nextMove = `Open a room in ${topCity} and text the list`;
    } else if (!fans) {
      nextMove = "Share Fan Gate — capture email + city on every click";
    } else if (!tracks && !rels) {
      nextMove = "Upload one track";
    } else if (tracks && !withSpotify) {
      nextMove = "Paste Spotify link on your released title";
    } else if (tracks && rels) {
      nextMove =
        "Copy tip link + Fan Gate into bio — own the next click off-platform";
    } else {
      const livePending = pending.find((p) => !isStaleTitle(p.title));
      nextMove =
        livePending?.title || gaps[0] || "Open Moves — confirm the top card";
    }

    type SeedAction =
      | "CREATE_ROOM"
      | "OPEN_CATALOGUE"
      | "OPEN_SETTINGS"
      | "OPEN_OPPORTUNITIES"
      | "OPEN_CRM";
    let seedAction: SeedAction = "OPEN_OPPORTUNITIES";
    let seedLabel = "Open Moves";
    const seedPayload: Record<string, string> = {};
    const nm = nextMove.toLowerCase();
    if (topCity && nm.includes("room")) {
      seedAction = "CREATE_ROOM";
      seedLabel = `Create room · ${topCity}`;
      seedPayload.city = topCity;
      seedPayload.title = `Room · ${topCity}`;
    } else if (/upload|catalogue|spotify link|released title/.test(nm)) {
      seedAction = "OPEN_CATALOGUE";
      seedLabel = "Open Catalogue";
    } else if (/settings|brain|link spotify \/ socials/.test(nm)) {
      seedAction = "OPEN_SETTINGS";
      seedLabel = "Open Settings";
    } else if (/fan gate|tip link|bio/.test(nm)) {
      seedAction = "OPEN_CRM";
      seedLabel = nm.includes("tip") ? "Open Money" : "Open Fans";
      seedPayload.focus = nm.includes("tip") ? "money" : "fans";
    } else {
      seedAction = "OPEN_OPPORTUNITIES";
      seedLabel = "Open Moves";
    }

    const proposalId = `scan-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const seedProposal = {
      id: proposalId,
      title: nextMove,
      body:
        seedAction === "OPEN_CRM" && seedPayload.focus === "fans"
          ? "Every Fan Gate join is an email + city you own. Put the link in bio and WhatsApp."
          : topCity
            ? `From your scan: ${topCityCount} fans in ${topCity}. Create the room and share the link.`
            : "One action this week. Confirm in Moves if you want the full list.",
      urgency: "today" as const,
      impact: "high" as const,
      source: "brain" as const,
      action: {
        type: seedAction,
        label: seedLabel,
        payload: seedPayload,
      },
      status: "pending" as const,
      createdAt: Date.now(),
    };

    try {
      const existing = (inbox.proposals || []) as {
        id?: string;
        status?: string;
      }[];
      // Drop stale scan seeds + keep webhooks only among pending
      const kept = existing.filter((p) => {
        if (!p.id) return false;
        if (String(p.id).startsWith(`scan-${user.id.slice(0, 8)}`)) return false;
        if (p.status === "pending" && isStaleTitle(p.title)) return false;
        return true;
      });
      await sb
        .from("profiles")
        .update({
          agent_inbox: {
            proposals: [seedProposal, ...kept].slice(0, 40),
            scannedAt: Date.now(),
            narrative: `Scan: ${nextMove}`,
          },
        })
        .eq("id", user.id);
    } catch {
      /* soft */
    }

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
      pendingAgent: pending.length + 1,
      gaps,
      nextMove,
      findings,
      topCity,
      topCityCount,
      topCityReady,
      proposalId,
      seedAction,
      seedLabel,
    };

    return NextResponse.json({ ok: true, steps, summary });
  } catch (e) {
    console.error("activate research", e);
    return NextResponse.json({ error: "research_failed" }, { status: 500 });
  }
}
