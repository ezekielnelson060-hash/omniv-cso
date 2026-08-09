/**
 * Public Spotify Web API metrics (client credentials).
 * Full Spotify for Artists charts require a partner program — not available
 * via standard Web API. We pull what is public: popularity, followers, track meta.
 */

import { fetchSpotifyArtist } from "@/lib/audit/spotify";

export type SpotifyTrackMetrics = {
  id: string;
  name: string;
  popularity: number;
  durationMs: number;
  artists: string[];
  album?: string;
  externalUrl: string;
  previewUrl?: string | null;
};

let cachedToken: { access: string; exp: number } | null = null;

async function getAppToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID?.trim();
  const secret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!id || !secret) return null;
  if (cachedToken && Date.now() < cachedToken.exp - 60_000) {
    return cachedToken.access;
  }
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    console.error("Spotify app token", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    access: data.access_token,
    exp: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

/** Extract Spotify track or artist id from open.spotify.com URLs. */
export function parseSpotifyUrl(
  url: string
): { type: "track" | "artist" | "album"; id: string } | null {
  const u = (url || "").trim();
  if (!u) return null;
  const m = u.match(
    /open\.spotify\.com\/(track|artist|album)\/([a-zA-Z0-9]+)/
  );
  if (m) {
    return { type: m[1] as "track" | "artist" | "album", id: m[2] };
  }
  const uri = u.match(/spotify:(track|artist|album):([a-zA-Z0-9]+)/);
  if (uri) {
    return { type: uri[1] as "track" | "artist" | "album", id: uri[2] };
  }
  return null;
}

export async function fetchSpotifyTrack(
  trackId: string
): Promise<SpotifyTrackMetrics | null> {
  const token = await getAppToken();
  if (!token) return null;
  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Spotify track", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as {
    id: string;
    name: string;
    popularity?: number;
    duration_ms?: number;
    preview_url?: string | null;
    artists?: { name: string }[];
    album?: { name?: string };
    external_urls?: { spotify?: string };
  };
  return {
    id: data.id,
    name: data.name,
    popularity: data.popularity ?? 0,
    durationMs: data.duration_ms ?? 0,
    artists: (data.artists || []).map((a) => a.name),
    album: data.album?.name,
    externalUrl: data.external_urls?.spotify || "",
    previewUrl: data.preview_url,
  };
}

export async function metricsFromSpotifyUrl(url: string): Promise<{
  entityType: "track" | "artist";
  entityId: string;
  title: string;
  popularity: number;
  followers?: number;
  externalUrl: string;
  extra: Record<string, unknown>;
} | null> {
  const parsed = parseSpotifyUrl(url);
  if (!parsed) return null;
  if (parsed.type === "track") {
    const t = await fetchSpotifyTrack(parsed.id);
    if (!t) return null;
    return {
      entityType: "track",
      entityId: t.id,
      title: t.name,
      popularity: t.popularity,
      externalUrl: t.externalUrl || url,
      extra: {
        artists: t.artists,
        album: t.album,
        durationMs: t.durationMs,
      },
    };
  }
  if (parsed.type === "artist") {
    const a = await fetchSpotifyArtist(parsed.id);
    if (!a) return null;
    return {
      entityType: "artist",
      entityId: a.id,
      title: a.name,
      popularity: a.popularity,
      followers: a.followers,
      externalUrl: a.externalUrl || url,
      extra: { genres: a.genres },
    };
  }
  return null;
}
