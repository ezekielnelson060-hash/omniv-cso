"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Flame, Loader2 } from "lucide-react";
import { briefForCity } from "@/lib/strategy/city-demand";

type CityRow = {
  city: string;
  total: number;
  ready: number;
  heat: number;
  line: string;
  ticket: number;
  cap: number;
};

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
      const list = [...map.entries()].map(([city, v]) => {
        const brief = briefForCity({
          city,
          count: v.total,
          wouldAttend: v.ready,
        });
        return {
          city,
          total: v.total,
          ready: v.ready,
          heat: 0,
          line: brief.line,
          ticket: brief.optimalTicketUsd,
          cap: brief.recommendedCap,
        };
      });
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
    <Card className="p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <Flame className="h-4 w-4 text-omniv-gold" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Who would show up
          </p>
          <p className="text-[11px] text-omniv-text-muted">
            Fans × intent → ticket × room size. Not vanity listeners.
          </p>
        </div>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 py-4 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mapping…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-3 text-xs text-omniv-text-muted">
          No city data yet. Fan Gate captures city + would attend.
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div
              key={r.city}
              className="rounded-xl border border-omniv-border/70 bg-omniv-black/30 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold">{r.city}</p>
                <span className="shrink-0 font-data text-[10px] text-omniv-gold">
                  {r.heat}% heat
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-omniv-text-secondary">
                {r.line}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-omniv-border">
                <div
                  className="h-full rounded-full bg-omniv-gold"
                  style={{ width: `${Math.min(100, r.heat)}%` }}
                />
              </div>
              {onCreateGathering && (
                <Button
                  size="sm"
                  className="mt-2 h-8 rounded-lg text-[11px]"
                  onClick={() => onCreateGathering(r.city, r.ready || r.total)}
                >
                  Open room · {r.cap}-cap
                  {r.ticket > 0 ? ` · $${r.ticket}` : " · free+tip"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
