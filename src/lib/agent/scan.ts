import type { ArtistBrain } from "@/types";
import type { CatalogueRelease, CatalogueTrack } from "@/types";
import type { AgentProposal, AgentScanResult } from "@/lib/agent/types";

type FanCity = { city: string; count: number };

/** Precision plan steps with matching CTAs. */
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
  interests?: string[];
}): AgentScanResult {
  const now = Date.now();
  const name = input.brain?.stageName || input.brain?.name || "Artist";
  const dream =
    input.brain?.bigDream?.trim() || input.brain?.goals?.[0]?.trim() || "";
  const interests = (input.interests || []).map((i) => i.toLowerCase());
  const wantsMoney =
    interests.some((i) => /money|revenue|ticket|merch|tip/.test(i)) ||
    /ticket|list to|sell|cash|revenue/i.test(dream);
  const wantsLive =
    interests.some((i) => /live|show|tour|room|venue/.test(i)) ||
    /headlin|capacity|room|show|tour/i.test(dream);
  const wantsRelease =
    interests.some((i) => /release|playlist|radio|content/.test(i)) ||
    Boolean(input.tracks?.length || input.releases?.length);
  const wantsIndustry =
    interests.some((i) => /label|sync|industry|pitch/.test(i)) ||
    /label|netflix|sync/i.test(dream);

  const proposals: AgentProposal[] = [];
  const topCity = (input.fanCities || []).sort((a, b) => b.count - a.count)[0];
  const hasAudio = (input.tracks || []).some((t) => t.audioPath || t.analysis);
  const released = (input.releases || []).filter((r) => {
    const s = String(r.status || "").toLowerCase();
    return s === "released" || s === "live" || s === "out";
  });
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
      body: "Settings → Artist Brain. Example: Own 2k fans in Lagos and sell a 200-cap room.",
      urgency: "now",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_SETTINGS",
        label: "Open Artist Brain",
        payload: { tab: "brain" },
      },
    });
  }

  if (!hasAudio) {
    add({
      id: "setup-audio",
      title: "Upload one track",
      body: "Music → Catalogue. Audio unlocks release plans and room previews.",
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
      title: "Add Spotify + one social link",
      body: "Settings → links. Needed for popularity and discovery moves.",
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
    const title = String(missingSpotify[0]?.title || "release");
    add({
      id: "setup-spotify-url",
      title: `Paste Spotify URL on “${title.slice(0, 28)}”`,
      body: "Catalogue → release → Spotify link. Then Progress can track real popularity.",
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

  if (fanCount === 0) {
    add({
      id: "capture-fan-gate",
      title: "Put Fan Gate link in bio + WhatsApp status",
      body: "Command Center → Fans → copy gate link. Every join = email + city you own.",
      urgency: "today",
      impact: "high",
      source: "audience",
      action: {
        type: "OPEN_CRM",
        label: "Copy Fan Gate",
        payload: { focus: "fans" },
      },
    });
  }

  if (fanCount > 0 && fanCount < 20) {
    add({
      id: "capture-gate-boost",
      title: "Send Fan Gate to your existing chat lists",
      body: `${fanCount} owned fans. Forward the gate link in WhatsApp/Telegram once — ask city + would-attend.`,
      urgency: "this_week",
      impact: "high",
      source: "audience",
      action: {
        type: "OPEN_CRM",
        label: "Open Fans",
        payload: { focus: "fans" },
      },
    });
  }

  if (wantsMoney || hasAudio) {
    if (!input.hasPayout) {
      add({
        id: "money-payout",
        title: "Turn on Get paid (bank → auto-pay)",
        body: "Settings → Get paid. About 90% of tickets and tips go to your account.",
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
    add({
      id: "money-tip-bio",
      title: "Copy tip link into bio (soft, not pushy)",
      body: "Money → tip link. Caption idea: If the music helped this week — support the next one here.",
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

  if (topCity && topCity.count >= 1) {
    add({
      id: `room-${topCity.city.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Create gathering in ${topCity.city}`,
      body: `${topCity.count} fans marked this city. Rooms → create → share link in chat.`,
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
    add({
      id: `invite-${topCity.city.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Email/text your ${topCity.city} list the room link`,
      body: "One short invite: date, city, link. Ask them to reply in the room chat.",
      urgency: "this_week",
      impact: "high",
      source: "audience",
      action: {
        type: "OPEN_CRM",
        label: "Open Rooms",
        payload: { focus: "room", city: topCity.city },
      },
    });
  } else if (wantsLive && fanCount === 0) {
    add({
      id: "live-need-city",
      title: "Capture cities before booking a room",
      body: "Share Fan Gate first. When a city hits a few fans, open the room there.",
      urgency: "today",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_CRM",
        label: "Open Fans",
        payload: { focus: "fans" },
      },
    });
  }

  if (wantsRelease && hasAudio) {
    add({
      id: "release-lock",
      title: "Lock date or Hold on your next release",
      body: "Catalogue → release → set date or Hold. Then film one 15s hook for that date.",
      urgency: "this_week",
      impact: "high",
      source: "catalogue",
      action: {
        type: "OPEN_CATALOGUE",
        label: "Open Catalogue",
        payload: { phase: "release" },
      },
    });
    add({
      id: "release-content",
      title: "Open Content — make one reel for the drop",
      body: "Content studio: one 15s hook tied to your release date. Soft tip line, Fan Gate in bio.",
      urgency: "this_week",
      impact: "high",
      source: "catalogue",
      action: {
        type: "OPEN_CONTENT",
        label: "Open Content",
        payload: {},
      },
    });
    add({
      id: "release-sim",
      title: "Run Release simulator before you spend",
      body: "Release → simulator. Check readiness before ads or playlist pitches.",
      urgency: "this_week",
      impact: "medium",
      source: "catalogue",
      action: {
        type: "OPEN_RELEASE",
        label: "Open Release",
        payload: {},
      },
    });
  }

  if (wantsIndustry && hasAudio) {
    add({
      id: "industry-label-hub",
      title: "Open Label hub — roster + label tools",
      body: "Label workspace for multi-act and outreach tracking. Use with your shortlist.",
      urgency: "this_week",
      impact: "medium",
      source: "market",
      action: {
        type: "OPEN_LABEL",
        label: "Open Label",
        payload: {},
      },
    });
    add({
      id: "industry-labels",
      title: "Build a 5-label shortlist that fits your sound",
      body: "Ziki drafts the list from genre + dream. You send one short email each.",
      urgency: "this_week",
      impact: "medium",
      source: "market",
      action: {
        type: "OPEN_ZIKI",
        label: "List labels in Ziki",
        payload: {
          q: `Based on my Artist Brain and dream "${dream || "growth"}", list 5 labels that fit. For each: why + one-line email open.`,
        },
      },
    });
  }

  if (dream && topCity) {
    add({
      id: "dream-city-list",
      title: `Message ${topCity.city} about a paid room`,
      body: `Goal: “${dream.slice(0, 70)}${dream.length > 70 ? "…" : ""}”. Date + tip/ticket link in one message.`,
      urgency: "this_week",
      impact: "high",
      source: "brain",
      action: {
        type: "OPEN_CRM",
        label: "Open Rooms",
        payload: { focus: "room", city: topCity.city },
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

  const setup = unique.filter((p) => p.id.startsWith("setup-"));
  const rest = unique.filter((p) => !p.id.startsWith("setup-"));
  const ordered = [...setup, ...rest].slice(0, 10);

  const narrative = dream
    ? `${name}: ${ordered.length} precision moves toward your goal. Do the top one.`
    : `${name}: ${ordered.length} moves. Finish setup first so ranking gets real.`;

  return {
    proposals: ordered,
    scannedAt: now,
    narrative,
  };
}
