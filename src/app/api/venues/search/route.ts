import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side Nominatim search (avoids browser CORS / UA blocks).
 * GET ?city=Las+Vegas&q=music+venue
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const city = (sp.get("city") || "").trim();
  const q = (sp.get("q") || "music venue").trim();
  if (!city) {
    return NextResponse.json(
      { error: "city required", venues: [] },
      { status: 400 }
    );
  }

  const headers = {
    "Accept-Language": "en",
    "User-Agent":
      "OmnivVenueFinder/1.0 (https://omniv.media; support@omniv.media)",
  };

  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
      { headers, next: { revalidate: 0 } }
    );
    const geo = (await geoRes.json()) as {
      lat: string;
      lon: string;
      display_name?: string;
    }[];
    if (!geo?.[0]) {
      return NextResponse.json({
        venues: [],
        error: "City not found — try another spelling",
      });
    }
    const lat = Number(geo[0].lat);
    const lon = Number(geo[0].lon);

    const d = 0.35;
    const viewbox = `${lon - d},${lat + d},${lon + d},${lat - d}`;
    const queries = [
      `${q} ${city}`,
      `nightclub ${city}`,
      `concert hall ${city}`,
      `live music ${city}`,
      q,
    ];

    const byId = new Map<
      string,
      {
        id: string;
        name: string;
        lat: number;
        lon: number;
        address: string;
        type: string;
      }
    >();

    for (const query of queries) {
      if (byId.size >= 12) break;
      for (const bounded of ["1", "0"]) {
        if (byId.size >= 12) break;
        const url =
          `https://nominatim.openstreetmap.org/search?format=json&limit=10` +
          `&q=${encodeURIComponent(query)}` +
          (bounded === "1" ? `&viewbox=${viewbox}&bounded=1` : "");
        const placeRes = await fetch(url, {
          headers,
          next: { revalidate: 0 },
        });
        if (!placeRes.ok) continue;
        const places = (await placeRes.json()) as {
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          type?: string;
          class?: string;
        }[];
        for (const p of places || []) {
          const id = String(p.place_id);
          if (byId.has(id)) continue;
          const parts = (p.display_name || "").split(",");
          byId.set(id, {
            id,
            name: parts[0]?.trim() || "Venue",
            lat: Number(p.lat),
            lon: Number(p.lon),
            address: p.display_name || "",
            type: p.type || p.class || "place",
          });
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    const venues = Array.from(byId.values()).slice(0, 12);
    return NextResponse.json({
      venues,
      city: geo[0].display_name || city,
      error: venues.length
        ? null
        : "No venues found — try club, bar, or theater",
    });
  } catch (e) {
    console.error("[venues/search]", e);
    return NextResponse.json(
      { venues: [], error: "Search failed — try again" },
      { status: 502 }
    );
  }
}
