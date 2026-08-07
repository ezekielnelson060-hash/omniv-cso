"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Compass,
  MapPin,
  ExternalLink,
  Loader2,
  TrendingUp,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Audit = {
  id: string;
  share_slug: string;
  source_type: string;
  artist_name: string | null;
  headline: string | null;
  overall_score: number;
  created_at: string;
};

type City = { city: string; fans: number; ready: number };

type Tab = "rising" | "audits" | "cities";

function peakLabel(score: number, createdAt: string) {
  const ageDays =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (score >= 70 && ageDays <= 14) return "Peaking";
  if (score >= 55 && ageDays <= 30) return "Rising";
  if (score >= 40) return "Steady";
  return "Early";
}

export default function DiscoverPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("rising");
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"all" | "spotify" | "youtube">("all");
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/discover");
        const json = await res.json();
        setAudits(json.audits || []);
        setCities(json.cities || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return audits
      .filter((a) => {
        if (source !== "all" && a.source_type !== source) return false;
        if (a.overall_score < minScore) return false;
        if (!query) return true;
        const hay =
          `${a.artist_name || ""} ${a.headline || ""} ${a.source_type}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => {
        const ageA = Date.now() - new Date(a.created_at).getTime();
        const ageB = Date.now() - new Date(b.created_at).getTime();
        const rankA = a.overall_score * 2 - ageA / (1000 * 60 * 60 * 24);
        const rankB = b.overall_score * 2 - ageB / (1000 * 60 * 60 * 24);
        return rankB - rankA;
      });
  }, [audits, q, source, minScore]);

  const rising = useMemo(
    () =>
      filtered.filter((a) => {
        const label = peakLabel(a.overall_score, a.created_at);
        return label === "Peaking" || label === "Rising";
      }),
    [filtered]
  );

  const cityFiltered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return cities.filter((c) =>
      query ? c.city.toLowerCase().includes(query) : true
    );
  }, [cities, q]);

  const list = tab === "rising" ? rising : tab === "audits" ? filtered : [];

  return (
    <AppShell>
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-omniv-gold">
              <Compass className="h-4 w-4" />
              <span className="font-data text-[10px] uppercase tracking-[0.14em]">
                Discover
              </span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              Signal board
            </h1>
          </div>
          <p className="max-w-sm text-[11px] text-omniv-text-muted md:text-right">
            Who is peaking. Where rooms will fill. No private emails.
          </p>
        </div>

        <div className="sticky top-14 z-20 -mx-4 border-y border-omniv-border bg-omniv-elevated/95 px-4 py-2.5 backdrop-blur md:top-0 md:mx-0 md:rounded-xl md:border">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["rising", "Rising"],
                ["audits", "All audits"],
                ["cities", "Cities"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition",
                  tab === id
                    ? "bg-omniv-gold text-omniv-black"
                    : "bg-omniv-hover text-omniv-text-secondary hover:text-omniv-text"
                )}
              >
                {label}
              </button>
            ))}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-omniv-text-muted" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    tab === "cities" ? "Filter city…" : "Search artist…"
                  }
                  className="h-8 w-[140px] pl-8 text-xs sm:w-[180px]"
                />
              </div>
              {tab !== "cities" && (
                <>
                  <select
                    value={source}
                    onChange={(e) =>
                      setSource(
                        e.target.value as "all" | "spotify" | "youtube"
                      )
                    }
                    className="h-8 rounded-lg border border-omniv-border bg-omniv-card px-2 text-[11px] text-omniv-text"
                  >
                    <option value="all">All sources</option>
                    <option value="spotify">Spotify</option>
                    <option value="youtube">YouTube</option>
                  </select>
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="h-8 rounded-lg border border-omniv-border bg-omniv-card px-2 text-[11px] text-omniv-text"
                  >
                    <option value={0}>Any score</option>
                    <option value={40}>40+</option>
                    <option value={55}>55+</option>
                    <option value={70}>70+</option>
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm text-omniv-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {!loading && tab !== "cities" && (
          <div className="overflow-hidden rounded-xl border border-omniv-border">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-omniv-border bg-omniv-elevated/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted sm:grid-cols-[1fr_80px_72px_88px_auto]">
              <span>Artist</span>
              <span className="hidden sm:block">Source</span>
              <span className="text-right">Score</span>
              <span className="hidden text-right sm:block">Signal</span>
              <span className="w-16" />
            </div>
            {list.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-omniv-text-muted">
                {tab === "rising"
                  ? "No peaking scans yet. New high-score audits land here."
                  : "No audits match filters."}
              </p>
            )}
            {list.map((a) => {
              const signal = peakLabel(a.overall_score, a.created_at);
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-omniv-border px-3 py-2.5 last:border-0 hover:bg-omniv-hover/40 sm:grid-cols-[1fr_80px_72px_88px_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {a.artist_name || "Unknown"}
                    </p>
                    <p className="truncate text-[11px] text-omniv-text-muted">
                      {a.headline || "Relevance audit"}
                    </p>
                  </div>
                  <span className="hidden text-[11px] capitalize text-omniv-text-muted sm:block">
                    {a.source_type}
                  </span>
                  <span className="text-right font-data text-sm text-omniv-gold">
                    {a.overall_score}
                  </span>
                  <span
                    className={cn(
                      "hidden items-center justify-end gap-1 text-[11px] font-medium sm:inline-flex",
                      signal === "Peaking" && "text-omniv-gold",
                      signal === "Rising" && "text-omniv-success",
                      signal === "Steady" && "text-omniv-text-secondary",
                      signal === "Early" && "text-omniv-text-muted"
                    )}
                  >
                    {(signal === "Peaking" || signal === "Rising") && (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {signal}
                  </span>
                  <Link href={`/audit/${a.share_slug}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 px-2 text-[11px]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "cities" && (
          <div className="overflow-hidden rounded-xl border border-omniv-border">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-omniv-border bg-omniv-elevated/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              <span>City</span>
              <span className="text-right">Fans</span>
              <span className="text-right">Would attend</span>
            </div>
            {cityFiltered.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-omniv-text-muted">
                City density grows as Fan Gates fill.
              </p>
            )}
            {cityFiltered.map((c) => (
              <div
                key={c.city}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-omniv-border px-3 py-2.5 last:border-0 hover:bg-omniv-hover/40"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-omniv-gold" />
                  {c.city}
                </span>
                <span className="font-data text-sm tabular-nums">{c.fans}</span>
                <span className="font-data text-sm tabular-nums text-omniv-gold">
                  {c.ready}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
