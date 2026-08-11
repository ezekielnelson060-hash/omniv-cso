import type { AgentProposal } from "@/lib/agent/types";
import type { ArtistBrain } from "@/types";

/**
 * Always-on outside intelligence when News/X are quiet.
 * Genre/style → TikTok / Shorts / release angles (global, not region-locked).
 */
export function buildTrendProposals(input: {
  brain: ArtistBrain | null;
  platforms?: string[];
  hasAudio?: boolean;
  now?: number;
}): AgentProposal[] {
  const now = input.now ?? Date.now();
  const genre = (input.brain?.genre || []).slice(0, 3).join(", ") || "your lane";
  const style =
    input.brain?.musicStyle ||
    input.brain?.brandVoice ||
    "your current sound";
  const name = input.brain?.stageName || input.brain?.name || "Artist";
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const out: AgentProposal[] = [];

  out.push({
    id: `trend-${day}-tiktok-sound`,
    title: `Trending sound angle for ${genre}`,
    body: `Outside pattern: short-form clips in ${genre} are winning with a clear 1–3s open + loopable hook. Style cue: ${style}. Film 15s on a sound that matches energy, not a random viral meme.`,
    urgency: "today",
    impact: "high",
    source: "webhook",
    action: {
      type: "OPEN_CONTENT",
      label: "Open Content · sounds",
      payload: { focus: "trending", genre },
    },
    status: "pending",
    createdAt: now,
  });

  out.push({
    id: `trend-${day}-content-hooks`,
    title: "3 platform-native hooks for this week",
    body: `${name}: ship TikTok/Reels/Shorts with caption that is soft on tips, hard on curiosity. One clip should end on a lyric or beat drop people can duet.`,
    urgency: "this_week",
    impact: "high",
    source: "webhook",
    action: {
      type: "OPEN_CONTENT",
      label: "Open Content",
      payload: { focus: "studio" },
    },
    status: "pending",
    createdAt: now - 1000,
  });

  if (input.hasAudio) {
    out.push({
      id: `trend-${day}-release-window`,
      title: "Release window · content first",
      body: "Outside play: lock a date only after 5–7 native clips exist. Use Release to score readiness, then Content to fill the gap.",
      urgency: "this_week",
      impact: "medium",
      source: "webhook",
      action: {
        type: "OPEN_RELEASE",
        label: "Open Release",
        payload: {},
      },
      status: "pending",
      createdAt: now - 2000,
    });
  } else {
    out.push({
      id: `trend-${day}-upload-audio`,
      title: "Upload a track so trends can match BPM",
      body: "Catalogue audio unlocks better TikTok timing tips and release simulation. Trends without a track stay generic.",
      urgency: "today",
      impact: "high",
      source: "webhook",
      action: {
        type: "OPEN_CATALOGUE",
        label: "Open Catalogue",
        payload: {},
      },
      status: "pending",
      createdAt: now - 2000,
    });
  }

  return out;
}
