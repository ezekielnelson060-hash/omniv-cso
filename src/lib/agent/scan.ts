import type { ArtistBrain } from "@/types";
import type { CatalogueRelease, CatalogueTrack } from "@/types";
import type { AgentProposal, AgentScanResult } from "@/lib/agent/types";

type FanCity = { city: string; count: number };

/**
 * Sense → rank → one clear action per gap.
 * Titles and CTAs are what the artist does next — not strategy essays.
 */
export function runAgentScan(input: {
  brain: ArtistBrain | null;
  releases: CatalogueRelease[];
  tracks: CatalogueTrack[];
  platforms?: string[];
  linkedSurfaces?: number;
  fanCities?: FanCity[];
  completedOppIds?: string[];
  fanCount?: number;
  hasTipReady?: boolean;
  hasPayout?: boolean;
}): AgentScanResult {
  const now = Date.now();
  const name = input.brain?.stageName || input.brain?.name || "Artist";
  const dream =
    input.brain?.bigDream?.trim() || input.brain?.goals?.[0]?.trim() || "";
  const proposals: AgentProposal[] = [];

  const topCity = (input.fanCities || []).sort((a, b) => b.count - a.count)[0];
  const hasAudio = (input.tracks || []).some((t) => t.audioPath || t.analysis);
  const released = (input.releases || []).filter(
    (r) =>
      String(r.status || "").toLowerCase() === "released" ||
      String(r.status || "").toLowerCase() === "live"
  );
  const missingSpotify = released.filter((r) => {
    const any = r as unknown as Record<string, unknown>;
    const url =
      any.spotifyUrl ||
      any.spotify_url ||
      (any.links as { spotify?: string } | undefined)?.spotify;
    return !url;
  });
  const surfaceCount = input.linkedSurfaces ?? (input.platforms || []).length;
  const fanCount = input.fanCount ?? 0;

  function add(p: Omit<AgentProposal, "status" | "createdAt">) {
    proposals.push({ ...p, status: "pending", createdAt: now });
  }

  if (!dream) {
    add({
      id: "setup-dream",
      title: "Write one sentence for your big goal",
      body: "Settings → Artist Brain. Example: Own 2k fans in Lagos and sell out a 200-cap room. Ranking uses this.",
      urgency: "now",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Settings",
        payload: { tab: "brain" },
      },
    });
  }

  if (!hasAudio) {
    add({
      id: "setup-audio",
      title: "Upload one track",
      body: "Music → Catalogue. Add audio so Moves uses what you actually have, not guesses.",
      urgency: "today",
      impact: "high",
      source: "catalogue",
      action: {
        type: "OPEN_CATALOGUE",
        label: "Open Catalogue",
        payload: {},
      },
    });
  }

  if (surfaceCount < 2) {
    add({
      id: "setup-links",
      title: "Add two profile links",
      body: "Settings → links. Spotify + TikTok or Instagram.",
      urgency: "today",
      impact: "medium",
      source: "market",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Settings",
        payload: { tab: "links" },
      },
    });
  }

  if (missingSpotify.length > 0) {
    const title = String(missingSpotify[0]?.title || "released track");
    add({
      id: "setup-spotify-url",
      title: `Paste Spotify link on "${title.slice(0, 32)}"`,
      body: "Catalogue → that release → Spotify URL. One link so Progress can read popularity.",
      urgency: "today",
      impact: "high",
      source: "catalogue",
      action: {
        type: "OPEN_CATALOGUE",
        label: "Open Catalogue",
        payload: {},
      },
    });
  }

  if (topCity && topCity.count >= 1) {
    add({
      id: `room-${topCity.city.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Open a room in ${topCity.city}`,
      body: `${topCity.count} fan${topCity.count === 1 ? "" : "s"} marked this city. Rooms → create → share link in chat.`,
      urgency: "this_week",
      impact: "high",
      source: "audience",
      action: {
        type: "CREATE_ROOM",
        label: "Create room",
        payload: {
          city: topCity.city,
          title: `Room · ${topCity.city}`,
        },
      },
    });
  } else if (fanCount === 0) {
    add({
      id: "setup-fan-gate",
      title: "Share your Fan Gate link",
      body: "Command Center → Fans. Copy the gate link into bio or WhatsApp so people join with a city.",
      urgency: "today",
      impact: "high",
      source: "audience",
      action: {
        type: "OPEN_CRM",
        label: "Open Fans",
        payload: { focus: "fans" },
      },
    });
  }

  if (!input.hasPayout) {
    add({
      id: "setup-payout",
      title: "Turn on Get paid",
      body: "Settings → Get paid. Country, bank, account → Turn on auto-pay. About 90% of tickets and tips go to you.",
      urgency: "this_week",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Get paid",
        payload: { tab: "payout" },
      },
    });
  }

  if (input.hasPayout) {
    add({
      id: "setup-tip",
      title: "Copy your tip link",
      body: "Command Center → Money. Copy tip link. Put it in bio or send in room chat.",
      urgency: "this_week",
      impact: "medium",
      source: "audience",
      action: {
        type: "OPEN_CRM",
        label: "Open Money",
        payload: { focus: "money" },
      },
    });
  }

  if (dream && topCity) {
    add({
      id: "dream-city-list",
      title: `Message your ${topCity.city} list about a room`,
      body: `Goal: "${dream.slice(0, 80)}${dream.length > 80 ? "…" : ""}". Open ${topCity.city} room chat. Send date + tip link. One message beats ten posts.`,
      urgency: "this_week",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_CRM",
        label: "Open Rooms",
        payload: { focus: "room", city: topCity.city },
      },
    });
  } else if (dream && hasAudio) {
    add({
      id: "dream-proof",
      title: "Name the next city you can fill",
      body: `Toward "${dream.slice(0, 70)}${dream.length > 70 ? "…" : ""}": pick one city you can fill in 60 days. Write it in Artist Brain, then open a room when fans mark it.`,
      urgency: "this_week",
      impact: "medium",
      source: "brain",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Artist Brain",
        payload: { tab: "brain" },
      },
    });
  }

  const seenId = new Set<string>();
  const seenTitle = new Set<string>();
  const unique = proposals.filter((p) => {
    if (seenId.has(p.id)) return false;
    const tk = p.title.toLowerCase().slice(0, 48);
    if (seenTitle.has(tk)) return false;
    seenId.add(p.id);
    seenTitle.add(tk);
    return true;
  });

  const setupIds = new Set(
    unique.filter((p) => p.id.startsWith("setup-")).map((p) => p.id)
  );
  const ordered = [
    ...unique.filter((p) => setupIds.has(p.id)),
    ...unique.filter((p) => !setupIds.has(p.id)),
  ].slice(0, 8);

  const narrative = dream
    ? `${name}: ${ordered.length} clear actions toward your goal. Confirm one and do it.`
    : `${name}: ${ordered.length} setup actions. Finish these first so ranking gets real.`;

  return {
    proposals: ordered,
    scannedAt: now,
    narrative,
  };
}
