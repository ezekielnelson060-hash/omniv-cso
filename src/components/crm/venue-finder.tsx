"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ExternalLink, Loader2, Search } from "lucide-react";

type Venue = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  type: string;
};

/** Real places near a city via OpenStreetMap Nominatim. */
export function VenueFinder({
  city: seedCity,
  onPick,
}: {
  city?: string | null;
  onPick?: (venue: { name: string; city: string; address: string }) => void;
}) {
  const [city, setCity] = useState(seedCity || "");
  const [query, setQuery] = useState("music venue");
  const [rows, setRows] = useState<Venue[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (seedCity) setCity(seedCity);
  }, [seedCity]);

  async function search() {
    const c = city.trim();
    if (!c) {
      setErr("Enter a city first");
      return;
    }
    setBusy(true);
    setErr(null);
    setRows([]);
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(c)}`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "OmnivVenueFinder/1.0",
          },
        }
      );
      const geo = (await geoRes.json()) as { lat: string; lon: string }[];
      if (!geo?.[0]) {
        setErr("City not found — try another spelling");
        return;
      }
      const lat = Number(geo[0].lat);
      const lon = Number(geo[0].lon);
      const d = 0.12;
      const viewbox = `${lon - d},${lat + d},${lon + d},${lat - d}`;
      const q = `${query.trim() || "venue"} ${c}`;
      const placeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=12&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "OmnivVenueFinder/1.0",
          },
        }
      );
      const places = (await placeRes.json()) as {
        place_id: number;
        display_name: string;
        lat: string;
        lon: string;
        type?: string;
        class?: string;
      }[];
      setRows(
        (places || []).map((p) => {
          const parts = (p.display_name || "").split(",");
          return {
            id: String(p.place_id),
            name: parts[0]?.trim() || "Venue",
            lat: Number(p.lat),
            lon: Number(p.lon),
            address: p.display_name,
            type: p.type || p.class || "place",
          };
        })
      );
      if (!(places || []).length)
        setErr("No venues in that box — broaden the search term");
    } catch {
      setErr("Search failed — check network and try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-omniv-border bg-omniv-card p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-omniv-gold" />
        <div>
          <p className="text-sm font-semibold tracking-tight">Find a venue</p>
          <p className="text-[11px] text-omniv-text-muted">
            After you see your hot city — search places nearby and book.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="h-10"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="music venue, club, studio…"
          className="h-10"
        />
        <Button
          className="h-10 gap-1.5 rounded-xl"
          disabled={busy}
          onClick={() => void search()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>
      {err && <p className="text-[11px] text-amber-400">{err}</p>}
      <ul className="max-h-56 space-y-2 overflow-y-auto">
        {rows.map((v) => (
          <li
            key={v.id}
            className="rounded-xl border border-omniv-border/80 bg-omniv-black/40 px-3 py-2"
          >
            <p className="text-[13px] font-medium">{v.name}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-omniv-text-muted">
              {v.address}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={`https://www.openstreetmap.org/?mlat=${v.lat}&mlon=${v.lon}#map=17/${v.lat}/${v.lon}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-omniv-gold hover:underline"
              >
                Map <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + " " + v.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-omniv-text-secondary hover:text-omniv-gold"
              >
                Google Maps
              </a>
              {onPick && (
                <button
                  type="button"
                  className="text-[11px] font-medium text-omniv-gold hover:underline"
                  onClick={() =>
                    onPick({
                      name: v.name,
                      city: city.trim(),
                      address: v.address,
                    })
                  }
                >
                  Use in room
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
