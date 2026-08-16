/** Shape of roster_artists.public_page — one bio link for everything. */

export type ArtistPageLink = {
  label: string;
  url: string;
};

export type ArtistPageTrack = {
  title?: string;
  subtitle?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  downloadUrl?: string;
  coverUrl?: string;
};

export type ArtistPublicPage = {
  messageTop?: string;
  messageMiddle?: string;
  messageBottom?: string;
  track?: ArtistPageTrack;
  links?: ArtistPageLink[];
  tipEnabled?: boolean;
  tipAmounts?: number[];
  captureHeadline?: string;
  captureReward?: string;
  showWouldAttend?: boolean;
};

export const DEFAULT_PUBLIC_PAGE: ArtistPublicPage = {
  messageTop: "",
  messageMiddle: "",
  messageBottom: "",
  tipEnabled: true,
  tipAmounts: [3, 5, 10, 20],
  captureHeadline: "Get the next drop + shows near you",
  captureReward: "You're on the list. Next music and invites hit your inbox.",
  showWouldAttend: true,
  links: [],
  track: {},
};

export function mergePublicPage(
  raw: unknown
): ArtistPublicPage {
  const p = (raw && typeof raw === "object" ? raw : {}) as ArtistPublicPage;
  return {
    ...DEFAULT_PUBLIC_PAGE,
    ...p,
    track: { ...DEFAULT_PUBLIC_PAGE.track, ...(p.track || {}) },
    links: Array.isArray(p.links) ? p.links : [],
    tipAmounts:
      Array.isArray(p.tipAmounts) && p.tipAmounts.length
        ? p.tipAmounts
        : DEFAULT_PUBLIC_PAGE.tipAmounts,
  };
}

/** Spotify open URL → embed URL */
export function spotifyEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    // /track/ID or /album/ID or /playlist/ID
    const path = u.pathname.replace(/^\/intl-[a-z]{2}/, "");
    const m = path.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=omniv&theme=0`;
  } catch {
    return null;
  }
}
