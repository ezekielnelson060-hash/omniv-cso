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

/** Places near a city via Omniv → OpenStreetMap. */
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
      const res = await fetch(
        `/api/venues/search?city=${encodeURIComponent(c)}&q=${encodeURIComponent(query.trim() || "music venue")}`
      );
      const data = (await res.json()) as {
        venues?: Venue[];
        error?: string | null;
      };
      const list = data.venues || [];
      setRows(list);
      if (!list.length) {
        setErr(
          data.error || "No venues in that box — try club, bar, or theater"
        );
      }
    } catch {
      setErr("Search failed — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-omniv-border bg-omniv-card p-4">
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
        <div>
          <p className="text-sm font-semibold tracking-tight">Find a venue</p>
          <p className="text-[12px] text-omniv-text-muted">
            After you see your hot city — search places nearby and book.
          </p>
        </div>
      </div>
      <div className="space-y-2">
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
          className="h-10 w-full gap-1.5 rounded-xl"
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
