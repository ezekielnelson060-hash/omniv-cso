import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side Nominatim search.
 * GET ?city=Port+Harcourt&q=nightclub
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  let city = (sp.get("city") || "").trim();
  const q = (sp.get("q") || "music venue").trim();
  if (!city) {
    return NextResponse.json(
      { error: "city required", venues: [] },
      { status: 400 }
    );
  }

  const expansions: Record<string, string[]> = {
    "rivers state": ["Port Harcourt", "Rivers State Nigeria"],
    rivers: ["Port Harcourt", "Rivers Nigeria"],
    "port harcourt": ["Port Harcourt Nigeria", "Port Harcourt"],
    lagos: ["Lagos Nigeria", "Lagos"],
    abuja: ["Abuja Nigeria", "Abuja"],
    accra: ["Accra Ghana", "Accra"],
    kumasi: ["Kumasi Ghana"],
  };
  const key = city.toLowerCase();
  const cityTries = expansions[key] || [
    city,
    `${city} Nigeria`,
    `${city} Ghana`,
    `${city} Africa`,
  ];

  const headers = {
    "Accept-Language": "en",
    "User-Agent":
      "OmnivVenueFinder/1.0 (https://omniv.media; support@omniv.media)",
  };

  try {
    let lat = 0;
    let lon = 0;
    let resolved = city;
    for (const tryCity of cityTries) {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(tryCity)}`,
        { headers, next: { revalidate: 0 } }
      );
      const geo = (await geoRes.json()) as {
        lat: string;
        lon: string;
        display_name?: string;
      }[];
      if (geo?.[0]) {
        lat = Number(geo[0].lat);
        lon = Number(geo[0].lon);
        resolved = geo[0].display_name || tryCity;
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!lat && !lon) {
      return NextResponse.json({
        venues: [],
        error: "City not found — try Port Harcourt, Lagos, Accra…",
      });
    }

    const d = 0.45;
    const viewbox = `${lon - d},${lat + d},${lon + d},${lat - d}`;
    const base = cityTries[0] || city;
    const queries = [
      `${q} ${base}`,
      `nightclub ${base}`,
      `bar ${base}`,
      `hotel ${base}`,
      `restaurant ${base}`,
      `concert hall ${base}`,
      `live music ${base}`,
      `cinema ${base}`,
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
      if (byId.size >= 14) break;
      for (const bounded of ["1", "0"] as const) {
        if (byId.size >= 14) break;
        const url =
          `https://nominatim.openstreetmap.org/search?format=json&limit=10` +
          `&q=${encodeURIComponent(query)}` +
          (bounded === "1" ? `&viewbox=${viewbox}&bounded=1` : "");
        try {
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
        } catch {
          /* next */
        }
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    const venues = [...byId.values()];
    return NextResponse.json({
      venues,
      resolved,
      count: venues.length,
      error:
        venues.length === 0
          ? "No venues in OSM for that area — try city name only (e.g. Port Harcourt) and q=bar or nightclub"
          : undefined,
    });
  } catch (e) {
    console.error("[venues]", e);
    return NextResponse.json({
      venues: [],
      error: "Venue search failed — try again",
    });
  }
}
