import type { ArtistBrain } from "@/types";
import type { CatalogueRelease, CatalogueTrack } from "@/types";
import type { AgentProposal, AgentScanResult } from "@/lib/agent/types";
import { worldOpportunitiesFromCatalogue } from "@/lib/strategy/world-signals";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

type FanCity = { city: string; count: number };

/** Sense → Rank → Draft. Deterministic core; LLM can polish later. */
export function runAgentScan(input: {
  brain: ArtistBrain | null;
  releases: CatalogueRelease[];
  tracks: CatalogueTrack[];
  platforms?: string[];
  linkedSurfaces?: number;
  fanCities?: FanCity[];
  completedOppIds?: string[];
}): AgentScanResult {
  const now = Date.now();
  const name = input.brain?.stageName || input.brain?.name || "Artist";
  const dream =
    input.brain?.bigDream?.trim() || input.brain?.goals?.[0] || "";
  const proposals: AgentProposal[] = [];

  const world = worldOpportunitiesFromCatalogue(
    input.brain,
    input.releases,
    input.tracks,
    input.completedOppIds || []
  );

  for (const w of world.slice(0, 5)) {
    proposals.push({
      id: `agent-${w.id}`,
      title: w.title,
      body: `${w.summary}\n\nWhy: ${w.why}`,
      urgency:
        w.timing?.toLowerCase().includes("today") ||
        w.timing?.toLowerCase().includes("friday")
          ? "today"
          : "this_week",
      impact:
        w.impact === "High"
          ? "high"
          : w.impact === "Medium"
            ? "medium"
            : "low",
      source: w.id.startsWith("catalog")
        ? "catalogue"
        : w.id.startsWith("world")
          ? "calendar"
          : "market",
      action: {
        type: "OPEN_ZIKI",
        label: "Plan in Ziki",
        payload: {
          q: `My next move is: ${w.title}. ${w.summary} Give me the exact first action today.`,
        },
      },
      status: "pending",
      createdAt: now,
    });
  }

  const topCity = (input.fanCities || []).sort((a, b) => b.count - a.count)[0];
  if (topCity && topCity.count >= 3) {
    proposals.push({
      id: uid("room"),
      title: `Open a room in ${topCity.city}`,
      body: `${topCity.count} fans tagged this city. Invite the list before you spend on ads.`,
      urgency: "this_week",
      impact: "high",
      source: "audience",
      action: {
        type: "CREATE_ROOM",
        label: "Draft room",
        payload: { city: topCity.city, title: `Room · ${topCity.city}` },
      },
      status: "pending",
      createdAt: now,
    });
  }

  if (!dream) {
    proposals.push({
      id: uid("dream"),
      title: "Write your Big Dream",
      body: "One sentence in Settings. Without it, ranking is noise.",
      urgency: "now",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Settings",
        payload: { tab: "brain" },
      },
      status: "pending",
      createdAt: now,
    });
  }

  const surfaceCount = input.linkedSurfaces ?? (input.platforms || []).length;
  if (surfaceCount < 2) {
    proposals.push({
      id: uid("plat"),
      title: "Add at least two profile links",
      body: "Spotify, TikTok, Instagram, or YouTube. Settings → links.",
      urgency: "today",
      impact: "medium",
      source: "market",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Settings",
        payload: { tab: "links" },
      },
      status: "pending",
      createdAt: now,
    });
  }

  const hasAudio = (input.tracks || []).some((t) => t.audioPath || t.analysis);
  if (!hasAudio) {
    proposals.push({
      id: uid("cat"),
      title: "Upload one track",
      body: "Catalogue needs audio so ranking uses real inventory, not guesses.",
      urgency: "today",
      impact: "high",
      source: "catalogue",
      action: {
        type: "OPEN_CATALOGUE",
        label: "Open Catalogue",
        payload: {},
      },
      status: "pending",
      createdAt: now,
    });
  }

  const seen = new Set<string>();
  const unique = proposals.filter((p) => {
    const k = p.title.slice(0, 40);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const narrative = dream
    ? `${name}: ${unique.length} moves ranked against “${dream.slice(0, 60)}${dream.length > 60 ? "…" : ""}”. Confirm one.`
    : `${name}: ${unique.length} setup moves. Lock Big Dream in Settings so ranking tightens.`;

  return {
    proposals: unique.slice(0, 8),
    scannedAt: now,
    narrative,
  };
}
