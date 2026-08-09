/**
 * Ziki operating brief — what the artist is doing in Omniv.
 * Built server-side from brain + catalogue + fans + agent + recent app_events.
 * Injected into every Ziki call so the model can talk about real behaviour, not guesses.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentProposal } from "@/lib/agent/types";

export type OperatingBrief = {
  text: string;
  meta: {
    artistName: string;
    bigDream: string;
    fanCount: number;
    trackCount: number;
    releaseCount: number;
    pendingAgent: number;
    recentEventCount: number;
  };
};

function compactEvents(
  rows: { name: string; path?: string | null; meta?: unknown; created_at?: string }[]
): string[] {
  const lines: string[] = [];
  for (const r of rows.slice(0, 18)) {
    const when = r.created_at
      ? new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")
      : "";
    const meta =
      r.meta && typeof r.meta === "object"
        ? Object.entries(r.meta as Record<string, unknown>)
            .slice(0, 3)
            .map(([k, v]) => `${k}=${String(v).slice(0, 40)}`)
            .join(", ")
        : "";
    lines.push(
      `- ${when} · ${r.name}${r.path ? ` @ ${r.path}` : ""}${meta ? ` (${meta})` : ""}`
    );
  }
  return lines;
}

/**
 * Assemble a short operating brief for the signed-in user.
 * Failures are soft — Ziki still works with brain-only context.
 */
export async function buildOperatingBrief(
  adminOrUser: SupabaseClient,
  userId: string
): Promise<OperatingBrief> {
  const empty: OperatingBrief = {
    text: "",
    meta: {
      artistName: "your project",
      bigDream: "",
      fanCount: 0,
      trackCount: 0,
      releaseCount: 0,
      pendingAgent: 0,
      recentEventCount: 0,
    },
  };
  if (!userId) return empty;

  try {
    const [
      brainRes,
      profileRes,
      fansRes,
      tracksRes,
      releasesRes,
      eventsRes,
    ] = await Promise.all([
      adminOrUser
        .from("artist_brains")
        .select(
          "name, stage_name, genre, music_style, brand_voice, career_stage, big_dream, goals, strengths, weaknesses"
        )
        .eq("user_id", userId)
        .maybeSingle(),
      adminOrUser
        .from("profiles")
        .select("full_name, platforms, interests, agent_inbox, social_links")
        .eq("id", userId)
        .maybeSingle(),
      adminOrUser
        .from("fans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      adminOrUser
        .from("catalogue_tracks")
        .select("id, title, analysis", { count: "exact" })
        .eq("user_id", userId)
        .limit(12),
      adminOrUser
        .from("catalogue_releases")
        .select("id, title, status, spotify_url", { count: "exact" })
        .eq("user_id", userId)
        .limit(8),
      adminOrUser
        .from("app_events")
        .select("name, path, meta, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(24),
    ]);

    const brain = brainRes.data;
    const profile = profileRes.data;
    const artistName =
      (brain?.stage_name as string) ||
      (brain?.name as string) ||
      (profile?.full_name as string) ||
      "your project";
    const bigDream =
      (brain?.big_dream as string) ||
      ((brain?.goals as string[]) || [])[0] ||
      "";
    const platforms = (profile?.platforms as string[]) || [];
    const interests = (profile?.interests as string[]) || [];
    const fanCount = fansRes.count || 0;
    const tracks = tracksRes.data || [];
    const releases = releasesRes.data || [];
    const trackCount = tracksRes.count ?? tracks.length;
    const releaseCount = releasesRes.count ?? releases.length;

    const inbox = (profile?.agent_inbox || {}) as {
      proposals?: AgentProposal[];
      narrative?: string;
    };
    const pending = (inbox.proposals || []).filter(
      (p) => !p.status || p.status === "pending"
    );
    const pendingTitles = pending
      .slice(0, 4)
      .map((p) => `• ${p.title} [${p.source}/${p.urgency}]`)
      .join("\n");

    const events = eventsRes.data || [];
    const eventLines = compactEvents(events);

    const trackTitles = tracks
      .slice(0, 6)
      .map((t) => {
        const a = t.analysis as { bpm?: number; energy?: string } | null;
        const bpm = a?.bpm ? ` · ${a.bpm} BPM` : "";
        const energy = a?.energy ? ` · ${a.energy}` : "";
        return `• ${t.title || "untitled"}${bpm}${energy}`;
      })
      .join("\n");

    const releaseTitles = releases
      .slice(0, 5)
      .map((r) => {
        const live = r.spotify_url ? " · DSP linked" : "";
        return `• ${r.title || "untitled"}${r.status ? ` (${r.status})` : ""}${live}`;
      })
      .join("\n");

    // Behaviour signals from event names
    const names = events.map((e) => e.name);
    const usedZiki = names.filter((n) => n.startsWith("ziki")).length;
    const ranSim = names.includes("release_simulate");
    const touchedFans = names.some((n) => n.includes("fan"));
    const checkout = names.some((n) => n.startsWith("checkout"));

    const behaviour: string[] = [];
    if (usedZiki) behaviour.push(`Opened Ziki ${usedZiki}× recently`);
    if (ranSim) behaviour.push("Ran release simulator");
    if (touchedFans) behaviour.push("Worked fan gate / capture");
    if (checkout) behaviour.push("Touched checkout");
    if (pending.length)
      behaviour.push(`${pending.length} Agent proposal(s) waiting confirm`);
    if (trackCount && !releaseCount)
      behaviour.push("Has analysed tracks but few/no releases — ship bias");
    if (bigDream) behaviour.push(`Big Dream locked: “${bigDream.slice(0, 80)}”`);
    if (!platforms.length)
      behaviour.push("No platforms linked — scores stay soft");

    const text = [
      "=== OMNIV OPERATING BRIEF (server — prefer this over guesses) ===",
      `Artist: ${artistName}`,
      brain?.genre
        ? `Genre: ${((brain.genre as string[]) || []).join(", ")}`
        : null,
      brain?.career_stage ? `Stage: ${brain.career_stage}` : null,
      brain?.music_style
        ? `Style: ${String(brain.music_style).slice(0, 120)}`
        : null,
      bigDream ? `Big Dream: ${bigDream}` : "Big Dream: not set",
      brain?.goals
        ? `Goals: ${((brain.goals as string[]) || []).slice(0, 4).join("; ")}`
        : null,
      platforms.length
        ? `Platforms: ${platforms.join(", ")}`
        : "Platforms: none linked",
      interests.length ? `Interests: ${interests.join(", ")}` : null,
      `Owned fans: ${fanCount}`,
      `Catalogue: ${trackCount} track(s), ${releaseCount} release(s)`,
      trackTitles ? `Tracks in brain:\n${trackTitles}` : null,
      releaseTitles ? `Releases:\n${releaseTitles}` : null,
      pendingTitles
        ? `Agent pending:\n${pendingTitles}`
        : "Agent pending: none",
      inbox.narrative ? `Agent narrative: ${inbox.narrative}` : null,
      behaviour.length
        ? `Observed behaviour:\n${behaviour.map((b) => `• ${b}`).join("\n")}`
        : null,
      eventLines.length
        ? `Recent product activity (newest first):\n${eventLines.join("\n")}`
        : "Recent product activity: none logged yet",
      "=== END BRIEF ===",
      "Use this brief to talk about what they actually do in Omniv, what they skip, and how that serves or blocks the Big Dream. Do not invent activity that is not listed.",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      text,
      meta: {
        artistName,
        bigDream,
        fanCount,
        trackCount,
        releaseCount,
        pendingAgent: pending.length,
        recentEventCount: events.length,
      },
    };
  } catch (e) {
    console.error("buildOperatingBrief", e);
    return empty;
  }
}
