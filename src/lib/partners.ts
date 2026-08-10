/** Partner definitions for Omniv integrations. */

export type PartnerKind =
  | "distro"
  | "playlist"
  | "curator"
  | "sync"
  | "dsp"
  | "payments"
  | "radio";

export type PartnerDef = {
  id: string;
  kind: PartnerKind;
  name: string;
  blurb: string;
  path: "webhook" | "oauth" | "settings" | "manual";
  sampleTitle: string;
  sampleBody: string;
  docsHint: string;
};

export const PARTNERS: PartnerDef[] = [
  {
    id: "distro",
    kind: "distro",
    name: "Distribution",
    blurb: "Pre-save live, ISRC, store links, takedown signals.",
    path: "webhook",
    sampleTitle: "Distro: release live on Spotify",
    sampleBody:
      "Release “Midnight Run” is live. ISRC US-XX1-26-00001. Spotify + Apple links ready.",
    docsHint: "POST release live / pre-save events to the Agent webhook.",
  },
  {
    id: "playlist",
    kind: "playlist",
    name: "Playlist / editorial",
    blurb: "Adds, holds, pitch status from playlist tools.",
    path: "webhook",
    sampleTitle: "Playlist: added to AfroPulse Weekly",
    sampleBody:
      "Track pitched to playlist: AfroPulse Weekly. Curator: Ama K. Status: added.",
    docsHint:
      "Webhook title/body mentioning playlist or curator → Draft outreach.",
  },
  {
    id: "curator",
    kind: "curator",
    name: "Independent curators",
    blurb: "Blog / TikTok / radio curators outside major DSPs.",
    path: "webhook",
    sampleTitle: "Curator: pitch accepted — City Beats GH",
    sampleBody:
      "Curator: Kojo Mensah. Show: City Beats GH. Air window: Friday 9pm.",
    docsHint: "Same webhook; use actionType DRAFT_OUTREACH when known.",
  },
  {
    id: "sync",
    kind: "sync",
    name: "Sync / licensing",
    blurb: "Briefs, placements, agency opportunities.",
    path: "webhook",
    sampleTitle: "Sync brief: Netflix travel series (Afrobeats)",
    sampleBody:
      "Need upbeat Afrobeats 90–110 BPM, under 3:00, cleared masters. Deadline 14 days.",
    docsHint: "Webhook with sync/brief → opens Ziki pitch path.",
  },
  {
    id: "spotify",
    kind: "dsp",
    name: "Spotify",
    blurb: "OAuth + popularity snapshots into platform_metrics.",
    path: "oauth",
    sampleTitle: "Spotify connected",
    sampleBody: "DSP metrics cron will refresh popularity for Opportunities.",
    docsHint: "Settings → Connect Spotify. Cron fills platform_metrics.",
  },
  {
    id: "flutterwave",
    kind: "payments",
    name: "Flutterwave",
    blurb: "Tickets, tips, plan upgrades.",
    path: "settings",
    sampleTitle: "Payout connected",
    sampleBody: "Subaccount splits room tickets and tip jar to the artist.",
    docsHint: "Settings → payout / Flutterwave subaccount ID.",
  },
  {
    id: "radio",
    kind: "radio",
    name: "Radio / press",
    blurb: "Airplay and press hits as Agent outside signals.",
    path: "webhook",
    sampleTitle: "Radio: spin on YFM Accra",
    sampleBody:
      "Track spun 3× on YFM Drive. Producer wants live session contact.",
    docsHint: "Webhook → Agent inbox (outside filter).",
  },
];

export function partnerWebhookUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/agent/webhook`;
}
