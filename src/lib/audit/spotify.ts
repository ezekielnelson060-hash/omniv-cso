/**
 * Optional Spotify Web API enrichment (client credentials).
 * Env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
 */

export type SpotifyArtistStats = {
  id: string;
  name: string;
  popularity: number;
  followers: number;
  genres: string[];
  images: string[];
  externalUrl: string;
};

let cachedToken: { access: string; exp: number } | null = null;

async function getToken(): Promise<string | null> {
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
    console.error("Spotify token", res.status, await res.text());
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

export async function fetchSpotifyArtist(
  artistId: string
): Promise<SpotifyArtistStats | null> {
  const token = await getToken();
  if (!token) return null;
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Spotify artist", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as {
    id: string;
    name: string;
    popularity: number;
    followers?: { total?: number };
    genres?: string[];
    images?: { url: string }[];
    external_urls?: { spotify?: string };
  };
  return {
    id: data.id,
    name: data.name,
    popularity: data.popularity ?? 0,
    followers: data.followers?.total ?? 0,
    genres: data.genres || [],
    images: (data.images || []).map((i) => i.url),
    externalUrl: data.external_urls?.spotify || "",
  };
}
