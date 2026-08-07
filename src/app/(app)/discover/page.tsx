"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageChrome, Toolbar, Segmented } from "@/components/ui/page-chrome";
import {
  ExternalLink,
  Loader2,
  TrendingUp,
  Filter,
  Star,
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
  peak_score: number;
  spotify_popularity: number | null;
  spotify_followers: number | null;
  genres: string | null;
  momentum: number | null;
  reach: number | null;
};

type City = { city: string; fans: number; ready: number };
type Roster = {
  id: string;
  stage_name: string;
  slug: string;
  genre: string | null;
};

type Tab = "rising" | "audits" | "cities" | "roster";

function signalOf(a: Audit) {
  if (a.peak_score >= 75 && (a.spotify_popularity ?? 0) >= 40) return "Peaking";
  if (a.peak_score >= 60) return "Rising";
  if (a.overall_score >= 40) return "Steady";
  return "Early";
}

export default function DiscoverPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [roster, setRoster] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("rising");
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"all" | "spotify" | "youtube">("all");
  const [minPeak, setMinPeak] = useState(0);
  const [watch, setWatch] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/discover");
        const json = await res.json();
        setAudits(json.audits || []);
        setCities(json.cities || []);
        setRoster(json.roster || []);
      } finally {
        setLoading(false);
      }
    })();
    try {
      const w = JSON.parse(localStorage.getItem("omniv-ar-watch") || "[]");
      if (Array.isArray(w)) setWatch(w);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleWatch(id: string) {
    setWatch((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem("omniv-ar-watch", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return audits.filter((a) => {
      if (source !== "all" && a.source_type !== source) return false;
      if (a.peak_score < minPeak) return false;
      if (!query) return true;
      const hay =
        `${a.artist_name || ""} ${a.headline || ""} ${a.genres || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [audits, q, source, minPeak]);

  const rising = useMemo(
    () =>
      filtered.filter((a) => {
        const s = signalOf(a);
        return s === "Peaking" || s === "Rising";
      }),
    [filtered]
  );

  const list = tab === "rising" ? rising : tab === "audits" ? filtered : [];

  return (
    <AppShell>
      <PageChrome eyebrow="A&R" title="Discover">
        <p className="text-[11px] text-omniv-text-muted">
          Peak blends audit, Spotify popularity/followers when present, and
          recency.
        </p>
      </PageChrome>

      <Toolbar>
        <Segmented
          value={tab}
          onChange={(id) => setTab(id as Tab)}
          options={[
            { id: "rising", label: "Rising" },
            { id: "audits", label: "All" },
            { id: "cities", label: "Cities" },
            { id: "roster", label: "Roster" },
          ]}
        />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-omniv-text-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter…"
              className="h-7 w-[120px] pl-7 text-[11px] sm:w-[160px]"
            />
          </div>
          {tab !== "cities" && tab !== "roster" && (
            <>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as typeof source)}
                className="h-7 rounded-md border border-omniv-border bg-omniv-card px-1.5 text-[11px]"
              >
                <option value="all">Source</option>
                <option value="spotify">Spotify</option>
                <option value="youtube">YouTube</option>
              </select>
              <select
                value={minPeak}
                onChange={(e) => setMinPeak(Number(e.target.value))}
                className="h-7 rounded-md border border-omniv-border bg-omniv-card px-1.5 text-[11px]"
              >
                <option value={0}>Peak any</option>
                <option value={50}>Peak 50+</option>
                <option value={65}>Peak 65+</option>
                <option value={75}>Peak 75+</option>
              </select>
            </>
          )}
        </div>
      </Toolbar>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      )}

      {!loading && (tab === "rising" || tab === "audits") && (
        <div className="mt-2 overflow-hidden rounded-lg border border-omniv-border">
          <div className="grid grid-cols-[1fr_48px_48px_auto] gap-1 border-b border-omniv-border bg-omniv-elevated/60 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-omniv-text-muted sm:grid-cols-[1fr_56px_64px_72px_56px_auto]">
            <span>Artist</span>
            <span className="text-right">Peak</span>
            <span className="hidden text-right sm:block">Pop</span>
            <span className="hidden text-right sm:block">Followers</span>
            <span className="text-right">Signal</span>
            <span />
          </div>
          {list.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-omniv-text-muted">
              No matches. Run Spotify audits for live pop/followers.
            </p>
          )}
          {list.map((a) => {
            const signal = signalOf(a);
            const watched = watch.includes(a.id);
            return (
              <div
                key={a.id}
                className="grid grid-cols-[1fr_48px_48px_auto] items-center gap-1 border-b border-omniv-border px-2.5 py-2 last:border-0 hover:bg-omniv-hover/50 sm:grid-cols-[1fr_56px_64px_72px_56px_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">
                    {a.artist_name || "Unknown"}
                  </p>
                  <p className="truncate text-[10px] text-omniv-text-muted">
                    {a.genres || a.source_type}
                    {a.momentum != null ? ` · mom ${a.momentum}` : ""}
                  </p>
                </div>
                <span className="text-right font-data text-[13px] text-omniv-gold">
                  {a.peak_score}
                </span>
                <span className="hidden text-right font-data text-[12px] sm:block">
                  {a.spotify_popularity ?? "—"}
                </span>
                <span className="hidden text-right font-data text-[11px] text-omniv-text-muted sm:block">
                  {a.spotify_followers != null
                    ? a.spotify_followers >= 1000
                      ? `${(a.spotify_followers / 1000).toFixed(1)}k`
                      : a.spotify_followers
                    : "—"}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center justify-end gap-0.5 text-[10px] font-medium",
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
                <div className="flex items-center justify-end gap-0.5">
                  <button
                    type="button"
                    aria-label="Watchlist"
                    onClick={() => toggleWatch(a.id)}
                    className={cn(
                      "rounded p-1",
                      watched
                        ? "text-omniv-gold"
                        : "text-omniv-text-muted hover:text-omniv-text"
                    )}
                  >
                    <Star
                      className={cn("h-3.5 w-3.5", watched && "fill-current")}
                    />
                  </button>
                  <Link href={`/audit/${a.share_slug}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-1.5 text-[10px]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "cities" && (
        <div className="mt-2 overflow-hidden rounded-lg border border-omniv-border">
          {cities
            .filter((c) =>
              q ? c.city.toLowerCase().includes(q.toLowerCase()) : true
            )
            .map((c) => (
              <div
                key={c.city}
                className="flex items-center justify-between border-b border-omniv-border px-2.5 py-2 last:border-0 hover:bg-omniv-hover/50"
              >
                <span className="text-[13px]">{c.city}</span>
                <span className="font-data text-[12px] text-omniv-text-muted">
                  {c.fans} ·{" "}
                  <span className="text-omniv-gold">{c.ready} ready</span>
                </span>
              </div>
            ))}
        </div>
      )}

      {!loading && tab === "roster" && (
        <div className="mt-2 overflow-hidden rounded-lg border border-omniv-border">
          {roster.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-omniv-text-muted">
              No roster artists yet. Add them from Label workspace.
            </p>
          )}
          {roster
            .filter((r) =>
              q
                ? `${r.stage_name} ${r.genre || ""}`
                    .toLowerCase()
                    .includes(q.toLowerCase())
                : true
            )
            .map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border-b border-omniv-border px-2.5 py-2 last:border-0"
              >
                <div>
                  <p className="text-[13px] font-medium">{r.stage_name}</p>
                  <p className="text-[10px] text-omniv-text-muted">
                    {r.genre || "—"} · {r.slug}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </AppShell>
  );
}
