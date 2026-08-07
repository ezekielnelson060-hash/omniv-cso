export type DetectedSource = {
  type: "spotify" | "youtube" | "unknown";
  url: string;
  id?: string;
};

export function detectSource(raw: string): DetectedSource {
  const url = raw.trim();
  const spotify =
    /open\.spotify\.com\/artist\/([a-zA-Z0-9]+)/i.exec(url) ||
    /spotify:artist:([a-zA-Z0-9]+)/i.exec(url);
  if (spotify) {
    return {
      type: "spotify",
      url: `https://open.spotify.com/artist/${spotify[1]}`,
      id: spotify[1],
    };
  }
  const yt =
    /youtube\.com\/@([^/?\s]+)/i.exec(url) ||
    /youtube\.com\/channel\/([^/?\s]+)/i.exec(url) ||
    /youtube\.com\/c\/([^/?\s]+)/i.exec(url) ||
    /youtu\.be\/([^/?\s]+)/i.exec(url);
  if (yt) {
    return {
      type: "youtube",
      url: url.startsWith("http") ? url : `https://${url}`,
      id: yt[1],
    };
  }
  return { type: "unknown", url };
}

export type PublicMeta = {
  title: string;
  thumbnail?: string;
  provider?: string;
  author?: string;
};

/** oEmbed — no API key required */
export async function fetchOEmbed(url: string): Promise<PublicMeta | null> {
  try {
    if (url.includes("spotify.com")) {
      const res = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        title?: string;
        thumbnail_url?: string;
        provider_name?: string;
      };
      return {
        title: data.title || "Spotify artist",
        thumbnail: data.thumbnail_url,
        provider: data.provider_name || "Spotify",
      };
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        title?: string;
        thumbnail_url?: string;
        author_name?: string;
        provider_name?: string;
      };
      return {
        title: data.author_name || data.title || "YouTube channel",
        thumbnail: data.thumbnail_url,
        provider: data.provider_name || "YouTube",
        author: data.author_name,
      };
    }
  } catch {
    return null;
  }
  return null;
}
