import type { AuditFinding, AuditPayload, AuditSourceType } from "@/types";
import { detectSource, fetchOEmbed, type PublicMeta } from "@/lib/audit/fetch-public";
import { fetchSpotifyArtist } from "@/lib/audit/spotify";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function makeShareSlug(name: string) {
  const base = slugify(name || "artist") || "artist";
  const tail = Math.random().toString(36).slice(2, 8);
  return `${base}-${tail}`;
}

/** Public-signals relevance audit. Optional Spotify API enrichment. */
export async function runPublicAudit(rawUrl: string): Promise<AuditPayload> {
  const detected = detectSource(rawUrl);
  const meta: PublicMeta | null =
    detected.type !== "unknown" ? await fetchOEmbed(detected.url) : null;

  const spotify =
    detected.type === "spotify" && detected.id
      ? await fetchSpotifyArtist(detected.id)
      : null;

  const artistName =
    spotify?.name ||
    meta?.title?.replace(/\s*-\s*topic$/i, "").trim() ||
    meta?.author ||
    (detected.type === "spotify"
      ? "Spotify artist"
      : detected.type === "youtube"
        ? "YouTube channel"
        : "Artist");

  const sourceType: AuditSourceType = detected.type;
  const hasMeta = Boolean(meta?.title);
  const hasThumb = Boolean(meta?.thumbnail);

  let reach = hasMeta ? 52 : 28;
  let revenue = 30;
  let momentum = hasMeta ? 48 : 24;

  if (sourceType === "spotify") {
    reach += 12;
    revenue += 8;
    momentum += 6;
  }
  if (sourceType === "youtube") {
    reach += 10;
    revenue += 6;
    momentum += 10;
  }
  if (hasThumb) {
    reach += 4;
    momentum += 4;
  }

  if (spotify) {
    reach = Math.round(reach * 0.35 + spotify.popularity * 0.65);
    momentum = Math.round(momentum * 0.4 + spotify.popularity * 0.6);
    if (spotify.followers >= 100_000) revenue += 12;
    else if (spotify.followers >= 10_000) revenue += 6;
    else if (spotify.followers < 500) revenue -= 4;
    if (spotify.genres.length >= 2) momentum += 4;
  }

  if (sourceType === "spotify" || sourceType === "youtube") {
    revenue -= 6;
  }

  reach = clamp(reach);
  revenue = clamp(revenue);
  momentum = clamp(momentum);
  const overall = clamp(reach * 0.4 + revenue * 0.25 + momentum * 0.35);

  const findings: AuditFinding[] = [];

  if (sourceType === "unknown") {
    findings.push({
      id: "link",
      severity: "critical",
      title: "Link could not be classified",
      detail:
        "Use a full Spotify artist URL or YouTube channel URL. Without a clean public surface, the audit stays soft.",
    });
  }

  if (spotify) {
    findings.push({
      id: "spotify-pop",
      severity:
        spotify.popularity < 25
          ? "critical"
          : spotify.popularity < 50
            ? "watch"
            : "strength",
      title: `Spotify popularity ${spotify.popularity}/100 · ${spotify.followers.toLocaleString()} followers`,
      detail:
        spotify.genres.length > 0
          ? `Genres: ${spotify.genres.slice(0, 4).join(", ")}. Popularity is a relative ranking signal, not monthly listeners.`
          : "Popularity is a relative ranking signal on Spotify, not monthly listeners or revenue.",
    });
  }

  if (sourceType === "spotify") {
    findings.push({
      id: "single-surface",
      severity: "critical",
      title: "Reach is rented on one primary surface",
      detail:
        "A Spotify-only public footprint concentrates discovery where you do not own the relationship. Catalogue depth and owned audience are not visible from this link.",
    });
    findings.push({
      id: "revenue-opacity",
      severity: "watch",
      title: "Revenue leakage cannot be proven from a public link",
      detail:
        "Public Spotify pages do not expose payout or merch conversion. The usual gap is streams to owned list to product.",
    });
  }

  if (sourceType === "youtube") {
    findings.push({
      id: "cadence",
      severity: "watch",
      title: "Cultural momentum depends on cadence you have not locked",
      detail:
        "YouTube rewards consistent publishing. A channel link alone does not prove a system.",
    });
    findings.push({
      id: "cross-surface",
      severity: "critical",
      title: "Audio catalogue is not evidenced on this scan",
      detail:
        "A YouTube-first presence without a clear streaming catalogue often leaks listeners who never convert.",
    });
  }

  if (hasMeta || spotify) {
    findings.push({
      id: "identity",
      severity: "strength",
      title: "Public identity resolves cleanly",
      detail: `${artistName} resolves from the link. That is the baseline for ranking.`,
    });
  } else {
    findings.push({
      id: "identity-weak",
      severity: "critical",
      title: "Public identity did not resolve",
      detail:
        "oEmbed returned nothing. The page may be private, blocked, or the URL is incomplete.",
    });
  }

  findings.push({
    id: "owned",
    severity: "watch",
    title: "Owned audience is not visible",
    detail:
      "No public link proves an email list or fan gate. That is often the largest silent leak between attention and revenue.",
  });

  const ordered = [...findings]
    .sort((a, b) => {
      const rank = { critical: 0, watch: 1, strength: 2 };
      return rank[a.severity] - rank[b.severity];
    })
    .slice(0, 4);

  const nextMove =
    sourceType === "youtube"
      ? "Lock one weekly upload format and route every video CTA to an owned list (Fan Gate). Then connect the primary streaming catalogue."
      : sourceType === "spotify"
        ? "Stand up an owned capture path (Fan Gate) and a 14-day content spine that points back to the catalogue."
        : "Submit a valid Spotify artist or YouTube channel URL, then claim the profile inside Omniv.";

  return {
    sourceUrl: detected.url,
    sourceType,
    artistName,
    thumbnail: spotify?.images[0] || meta?.thumbnail,
    overall,
    reach,
    revenue,
    momentum,
    findings: ordered,
    nextMove,
    disclaimer:
      "Public signals only. This audit does not access Spotify for Artists, YouTube Analytics, or private revenue. Scores are directional.",
    signals: {
      resolved: hasMeta || Boolean(spotify),
      hasThumbnail: hasThumb || Boolean(spotify?.images[0]),
      provider: meta?.provider || (spotify ? "Spotify API" : null),
      sourceType,
      spotifyPopularity: spotify?.popularity ?? null,
      spotifyFollowers: spotify?.followers ?? null,
      genres: spotify?.genres?.slice(0, 5).join(", ") || null,
    },
  };
}
