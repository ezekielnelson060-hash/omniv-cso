import { worldOpportunitiesFromCatalogue } from "@/lib/strategy/world-opportunities";
import { uid } from "@/lib/utils";
import type { AgentProposal, AgentScanResult } from "@/lib/agent/types";
import type { ArtistBrain, CatalogueRelease, CatalogueTrack } from "@/types";

export function runAgentScan(input: {
  brain: ArtistBrain | null;
  releases?: CatalogueRelease[];
  tracks?: CatalogueTrack[];
  platforms?: string[];
  fanCities?: { city: string; count: number }[];
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
        label: "Execute in Ziki",
        payload: {
          q: `Execute this agent move:\n${w.title}\n${w.summary}\nNext: ${(w.nextActions || []).join("; ")}`,
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
      title: `Open a room where density is real: ${topCity.city}`,
      body: `${topCity.count} fans tagged ${topCity.city}. Owned list beats algorithmic hope. Draft a micro-gathering or tip room and invite that city first.`,
      urgency: "this_week",
      impact: "high",
      source: "audience",
      action: {
        type: "CREATE_ROOM",
        label: "Open rooms",
        payload: { city: topCity.city },
      },
      status: "pending",
      createdAt: now,
    });
  }

  if (!dream) {
    proposals.push({
      id: uid("dream"),
      title: "Name the Big Dream before more tactics",
      body: "Without a held image, every opportunity is noise. Write one sentence in Settings → Artist Brain that a manager would refuse to dilute.",
      urgency: "now",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_ZIKI",
        label: "Lock dream with Ziki",
        payload: {
          q: "Help me write one clear Big Dream sentence and the single weekly move that serves it.",
        },
      },
      status: "pending",
      createdAt: now,
    });
  }

  if ((input.platforms || []).length < 2) {
    proposals.push({
      id: uid("plat"),
      title: "Connect surfaces so the agent can see the world",
      body: "Fewer than two platforms linked. Scores and ranking stay soft until signal exists. Add links in Settings.",
      urgency: "today",
      impact: "medium",
      source: "market",
      action: {
        type: "OPEN_ZIKI",
        label: "Add links in Settings",
        payload: {
          q: "Help me decide which two platforms to link first so Omniv can scan real signal.",
        },
      },
      status: "pending",
      createdAt: now,
    });
  }

  const hasTrack = (input.tracks || []).length > 0;
  if (!hasTrack) {
    proposals.push({
      id: uid("cat"),
      title: "Upload one track so the agent can work inventory",
      body: "No catalogue audio yet. Upload a cut — Omniv reads BPM/energy and ranks ship plans off real inventory.",
      urgency: "today",
      impact: "high",
      source: "catalogue",
      action: {
        type: "OPEN_CATALOGUE",
        label: "Upload in Catalogue",
        payload: {},
      },
      status: "pending",
      createdAt: now,
    });
  }

  const unique = proposals
    .filter(
      (p, i, arr) => arr.findIndex((x) => x.title === p.title) === i
    )
    .slice(0, 8);

  const narrative = dream
    ? `${name}: agent ranked ${unique.length} moves against “${dream.slice(0, 60)}${dream.length > 60 ? "…" : "”"}. Confirm one. Dismiss the rest.`
    : `${name}: agent found ${unique.length} moves. Lock Big Dream so ranking tightens.`;

  return { proposals: unique, scannedAt: now, narrative };
}
