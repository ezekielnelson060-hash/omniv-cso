"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getArtistBrain } from "@/lib/db/profile";
import { listCatalogueReleases } from "@/lib/catalogue/db";
import {
  buildPredictiveReleaseCalendar,
  type CalendarWindow,
} from "@/lib/strategy/release-calendar";
import { Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PredictiveCalendar() {
  const [windows, setWindows] = useState<CalendarWindow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [brain, releases] = await Promise.all([
        getArtistBrain(),
        listCatalogueReleases(),
      ]);
      setWindows(buildPredictiveReleaseCalendar(brain, releases));
      setLoading(false);
    })();
  }, []);

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-omniv-gold" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Predictive windows
          </p>
          <p className="text-[11px] text-omniv-text-muted">
            Model guidance from calendar + catalogue — not private DSP charts.
          </p>
        </div>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 py-4 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scoring weeks…
        </p>
      ) : (
        <div className="space-y-2">
          {windows.slice(0, 6).map((w) => (
            <div
              key={w.id}
              className={cn(
                "rounded-lg border px-2.5 py-2",
                w.verdict === "Go"
                  ? "border-omniv-gold/40 bg-omniv-gold/5"
                  : w.verdict === "Hold"
                    ? "border-omniv-border opacity-70"
                    : "border-omniv-border"
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-medium">{w.weekLabel}</span>
                <Badge
                  variant={w.verdict === "Go" ? "gold" : "outline"}
                  className="text-[9px]"
                >
                  {w.verdict}
                </Badge>
                <span className="text-[10px] text-omniv-text-muted">
                  score {w.score}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-omniv-text-muted">
                {w.reasons[0]}
              </p>
              {w.culturalHooks[0] && (
                <p className="mt-0.5 text-[10px] text-omniv-gold/80">
                  {w.culturalHooks[0]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
