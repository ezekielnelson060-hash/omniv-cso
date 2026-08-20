"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import type { MarketDemandReport } from "@/lib/strategy/market-demand";
import { cn } from "@/lib/utils";

type ApiRes = {
  ok?: boolean;
  report?: MarketDemandReport;
  error?: string;
};

function levelStyle(level: string) {
  if (level === "verified")
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (level === "emerging")
    return "text-omniv-gold border-omniv-gold/30 bg-omniv-gold/10";
  if (level === "weak")
    return "text-amber-400/90 border-amber-500/20 bg-amber-500/5";
  return "text-omniv-text-muted border-omniv-border bg-omniv-elevated";
}

export function MarketDemandCard() {
  const [report, setReport] = useState<MarketDemandReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demand/market");
      const data = (await res.json()) as ApiRes;
      if (!res.ok) {
        setError(data.error || "Could not load demand");
        setReport(null);
      } else {
        setReport(data.report || null);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const top = report?.top;

  return (
    <Card className="overflow-hidden border-omniv-gold/20 p-0">
      <div className="border-b border-omniv-border/80 bg-omniv-gold/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-omniv-gold" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
                Regional · market demand
              </p>
              <p className="text-[12px] text-omniv-text-secondary">
                Your cities, your intent, your proof — not global noise
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 text-[11px]"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Re-scan"
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {loading && !report ? (
          <p className="flex items-center gap-2 py-6 text-sm text-omniv-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading fan cities…
          </p>
        ) : error ? (
          <p className="py-4 text-sm text-omniv-danger">{error}</p>
        ) : !top || report?.emptyReason ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-omniv-text-secondary">
              {report?.emptyReason ||
                "No city demand yet. Share Fan Gate to capture email, city, and would attend."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/crm">
                <Button className="h-9 gap-1.5 text-[13px]">
                  Open Fan Gate <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/crm?focus=room">
                <Button variant="outline" className="h-9 text-[13px]">
                  Rooms
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-omniv-text-muted">
                  <MapPin className="h-3.5 w-3.5" /> Strongest market
                </p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                  {top.city}
                </p>
                <p className="mt-1 text-[13px] text-omniv-text-secondary">
                  {top.fans} fans · {top.intentPct}% intent · ~
                  {top.addressable} addressable
                </p>
              </div>
              <div className="text-right">
                <p className="font-data text-3xl font-semibold text-omniv-gold">
                  {top.score}
                  <span className="text-base text-omniv-text-muted">/100</span>
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    levelStyle(top.level)
                  )}
                >
                  {top.level} · {top.confidence}
                </span>
              </div>
            </div>

            <p className="rounded-xl border border-omniv-border/70 bg-omniv-black/30 px-3 py-2.5 text-[13px] leading-snug text-omniv-text-secondary">
              {report?.recommendation}
            </p>

            <ul className="space-y-1 text-[12px] text-omniv-text-muted">
              {top.why.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>

            {report && report.cities.length > 1 && (
              <div className="space-y-2 border-t border-omniv-border/60 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-text-muted">
                  Other cities
                </p>
                {report.cities.slice(1, 5).map((c) => (
                  <div
                    key={c.city}
                    className="flex items-center justify-between gap-2 text-[13px]"
                  >
                    <span className="font-medium">{c.city}</span>
                    <span className="font-data text-omniv-text-muted">
                      {c.score}/100 · {c.level}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/crm?focus=room">
                <Button className="h-9 gap-1.5 text-[13px]">
                  Open room in {top.city}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/crm">
                <Button variant="outline" className="h-9 text-[13px]">
                  Fan list
                </Button>
              </Link>
            </div>

            {report && (
              <p className="text-[10px] text-omniv-text-muted">
                {report.totalFans} fans · {report.fansWithCity} with city ·{" "}
                {report.intentCount} would attend
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
