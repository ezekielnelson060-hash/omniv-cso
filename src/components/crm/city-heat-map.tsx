"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MapPin, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CityRow = { city: string; total: number; ready: number; heat: number };

export function CityHeatMap({
  onCreateGathering,
}: {
  onCreateGathering?: (city: string, ready: number) => void;
}) {
  const [rows, setRows] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("fans")
        .select("city, would_attend")
        .limit(3000);
      const map = new Map<string, { total: number; ready: number }>();
      for (const f of data || []) {
        const city = (f.city as string)?.trim() || "Unknown";
        const cur = map.get(city) || { total: 0, ready: 0 };
        cur.total += 1;
        if (f.would_attend) cur.ready += 1;
        map.set(city, cur);
      }
      const list = [...map.entries()].map(([city, v]) => ({
        city,
        ...v,
        heat: 0,
      }));
      const max = Math.max(1, ...list.map((r) => r.total + r.ready * 2));
      for (const r of list) {
        r.heat = Math.round(((r.total + r.ready * 2) / max) * 100);
      }
      setRows(
        list.sort((a, b) => b.heat - a.heat || b.total - a.total).slice(0, 16)
      );
      setLoading(false);
    })();
  }, []);

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <Flame className="h-4 w-4 text-omniv-gold" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            City heat
          </p>
          <p className="text-[11px] text-omniv-text-muted">
            Where the list is densest — open Drop Parties where heat is real.
          </p>
        </div>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 py-4 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mapping…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-3 text-xs text-omniv-text-muted">
          No city data yet. Fan Gate captures city on join.
        </p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.city} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 truncate text-[12px] font-medium">
                    <MapPin className="h-3 w-3 text-omniv-gold" />
                    {r.city}
                  </span>
                  <span className="shrink-0 text-[10px] text-omniv-text-muted">
                    {r.total} fans · {r.ready} ready
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-omniv-border">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      r.heat > 70
                        ? "bg-omniv-gold"
                        : r.heat > 40
                          ? "bg-omniv-gold/70"
                          : "bg-omniv-gold/40"
                    )}
                    style={{ width: `${r.heat}%` }}
                  />
                </div>
              </div>
              {onCreateGathering && r.ready > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0 text-[10px]"
                  onClick={() => onCreateGathering(r.city, r.ready)}
                >
                  Room
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
