"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MapPin, Users } from "lucide-react";

type CityRow = { city: string; total: number; ready: number };

export function AudienceMap({
  onCreateGathering,
}: {
  onCreateGathering?: (city: string, ready: number) => void;
}) {
  const [rows, setRows] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    void (async () => {
      const { data: roster } = await supabase
        .from("roster_artists")
        .select("id")
        .limit(20);
      const ids = (roster || []).map((r) => r.id as string);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      const { data: fans } = await supabase
        .from("fans")
        .select("city, would_attend")
        .in("artist_id", ids);

      const map = new Map<string, { total: number; ready: number }>();
      for (const f of fans || []) {
        const city = (f.city as string)?.trim() || "Unknown";
        const cur = map.get(city) || { total: 0, ready: 0 };
        cur.total += 1;
        if (f.would_attend) cur.ready += 1;
        map.set(city, cur);
      }
      const list = [...map.entries()]
        .map(([city, v]) => ({ city, ...v }))
        .sort((a, b) => b.ready - a.ready || b.total - a.total);
      setRows(list);
      setLoading(false);
    })();
  }, []);

  const top = useMemo(() => rows.slice(0, 8), [rows]);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-omniv-gold" />
        <h2 className="text-sm font-semibold tracking-tight">Audience map</h2>
      </div>
      <p className="mt-1 text-xs text-omniv-text-muted">
        Cities from Fan Gate. Ready = said they would attend a small room.
      </p>
      {loading && (
        <p className="mt-4 text-xs text-omniv-text-muted">Loading cities…</p>
      )}
      {!loading && top.length === 0 && (
        <p className="mt-4 text-xs text-omniv-text-muted">
          No cities yet. Share your Fan Gate so the list starts carrying location.
        </p>
      )}
      <ul className="mt-4 space-y-2">
        {top.map((r) => (
          <li
            key={r.city}
            className="flex items-center justify-between gap-2 rounded-xl border border-omniv-border bg-omniv-elevated/40 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{r.city}</p>
              <p className="text-[11px] text-omniv-text-muted">
                <Users className="mr-1 inline h-3 w-3" />
                {r.total} on list · {r.ready} would attend
              </p>
            </div>
            {r.ready > 0 && onCreateGathering && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-[11px]"
                onClick={() => onCreateGathering(r.city, r.ready)}
              >
                Host room
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
