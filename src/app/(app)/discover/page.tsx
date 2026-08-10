"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Loader2,
  TrendingUp,
  Star,
  MapPin,
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

const GENRE_CHIPS = [
  "all",
  "afrobeats",
  "hip-hop",
  "rap",
  "r&b",
  "pop",
  "electronic",
  "amapiano",
  "gospel",
  "rock",
  "alternative",
] as const;

function signalOf(a: Audit) {
  if (a.peak_score >= 75 && (a.spotify_popularity ?? 0) >= 40) return "Peaking";
  if (a.peak_score >= 60) return "Rising";
  if (a.overall_score >= 40) return "Steady";
  return "Early";
}

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-omniv-text-muted">
        {label}
      </p>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
        active
          ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
          : "border-omniv-border bg-omniv-card text-omniv-text-muted hover:border-omniv-border-subtle hover:text-omniv-text"
      )}
    >
      {children}
    </button>
  );
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
  const [genreFilter, setGenreFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
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

  const cityChips = useMemo(() => {
    const top = cities.slice(0, 12).map((c) => c.city);
    return ["all", ...top];
  }, [cities]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const g = genreFilter === "all" ? "" : genreFilter.toLowerCase();
    return audits.filter((a) => {
      if (source !== "all" && a.source_type !== source) return false;
      if (a.peak_score < minPeak) return false;
      if (g && !(a.genres || "").toLowerCase().includes(g)) return false;
      if (!query) return true;
      const hay =
        `${a.artist_name || ""} ${a.headline || ""} ${a.genres || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [audits, q, source, minPeak, genreFilter]);

  const rising = useMemo(
    () =>
      filtered.filter((a) => {
        const s = signalOf(a);
        return s === "Peaking" || s === "Rising";
      }),
    [filtered]
  );

  const list = tab === "rising" ? rising : tab === "audits" ? filtered : [];

  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      if (cityFilter !== "all" && c.city !== cityFilter) return false;
      if (q && !c.city.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cities, cityFilter, q]);

  return (
    <AppShell>
      <div className="relative -mx-3 mb-4 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/15 via-omniv-gold/8 to-transparent" />
        <div className="absolute -right-8 top-0 h-36 w-36 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="relative px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            A&R
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Discover
          </h1>
          <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
            Rising signals from audits, city heat, and roster — peak blends
            score, DSP pop, and recency.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(
              [
                ["rising", "Rising"],
                ["audits", "All"],
                ["cities", "Cities"],
                ["roster", "Roster"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition",
                  tab === id
                    ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                    : "border-omniv-border text-omniv-text-muted hover:text-omniv-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(tab === "rising" || tab === "audits") && (
        <div className="mb-4 space-y-3 rounded-2xl border border-omniv-border bg-omniv-card/60 p-3">
          <ChipRow label="Genre">
            {GENRE_CHIPS.map((g) => (
              <Chip
                key={g}
                active={genreFilter === g}
                onClick={() => setGenreFilter(g)}
              >
                {g === "all" ? "All genres" : g}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label="Source">
            {(
              [
                ["all", "Any source"],
                ["spotify", "Spotify"],
                ["youtube", "YouTube"],
              ] as const
            ).map(([id, label]) => (
              <Chip
                key={id}
                active={source === id}
                onClick={() => setSource(id)}
              >
                {label}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label="Peak">
            {[
              [0, "Any peak"],
              [50, "50+"],
              [65, "65+"],
              [75, "75+"],
            ].map(([v, label]) => (
              <Chip
                key={String(v)}
                active={minPeak === v}
                onClick={() => setMinPeak(Number(v))}
              >
                {label}
              </Chip>
            ))}
          </ChipRow>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search artist or headline…"
            className="h-10 rounded-xl text-sm"
          />
        </div>
      )}

      {tab === "cities" && (
        <div className="mb-4 space-y-3 rounded-2xl border border-omniv-border bg-omniv-card/60 p-3">
          <ChipRow label="City">
            {cityChips.map((c) => (
              <Chip
                key={c}
                active={cityFilter === c}
                onClick={() => setCityFilter(c)}
              >
                {c === "all" ? "All cities" : c}
              </Chip>
            ))}
          </ChipRow>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search city…"
            className="h-10 rounded-xl text-sm"
          />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-10 text-xs text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" /> Loading…
        </div>
      )}

      {!loading && (tab === "rising" || tab === "audits") && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-omniv-border px-4 py-10 text-center text-[12px] text-omniv-text-muted">
              No matches. Run Spotify audits for live pop/followers.
            </p>
          )}
          {list.map((a) => {
            const signal = signalOf(a);
            const watched = watch.includes(a.id);
            return (
              <div
                key={a.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card transition hover:border-omniv-gold/25"
              >
                <div className="flex gap-3 p-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-omniv-gold/10 text-lg font-semibold text-omniv-gold">
                    {(a.artist_name || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold tracking-tight">
                        {a.artist_name || "Unknown"}
                      </p>
                      <span className="font-data text-sm font-semibold tabular-nums text-omniv-gold">
                        {a.peak_score}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-omniv-text-muted">
                      {a.genres || a.source_type}
                      {a.spotify_popularity != null
                        ? ` · pop ${a.spotify_popularity}`
                        : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          signal === "Peaking" &&
                            "bg-omniv-gold/15 text-omniv-gold",
                          signal === "Rising" &&
                            "bg-emerald-500/15 text-emerald-400",
                          signal === "Steady" &&
                            "bg-white/5 text-omniv-text-secondary",
                          signal === "Early" &&
                            "bg-white/5 text-omniv-text-muted"
                        )}
                      >
                        {(signal === "Peaking" || signal === "Rising") && (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        {signal}
                      </span>
                      {a.spotify_followers != null && (
                        <span className="text-[10px] text-omniv-text-muted">
                          {a.spotify_followers >= 1000
                            ? `${(a.spotify_followers / 1000).toFixed(1)}k`
                            : a.spotify_followers}{" "}
                          followers
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex border-t border-omniv-border">
                  <button
                    type="button"
                    onClick={() => toggleWatch(a.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition hover:bg-white/[0.03]",
                      watched
                        ? "text-omniv-gold"
                        : "text-omniv-text-secondary hover:text-omniv-gold"
                    )}
                  >
                    <Star
                      className={cn("h-3.5 w-3.5", watched && "fill-current")}
                    />
                    {watched ? "Watching" : "Watch"}
                  </button>
                  <div className="w-px bg-omniv-border" />
                  <Link
                    href={`/audit/${a.share_slug}`}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium text-omniv-text-secondary transition hover:bg-white/[0.03] hover:text-omniv-gold"
                  >
                    Open
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "cities" && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCities.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-omniv-border px-4 py-10 text-center text-[12px] text-omniv-text-muted">
              No city heat yet — capture fans with city on the gate.
            </p>
          )}
          {filteredCities.map((c) => (
            <div
              key={c.city}
              className="flex items-center gap-3 rounded-2xl border border-omniv-border bg-omniv-card p-3.5 transition hover:border-omniv-gold/25"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/10">
                <MapPin className="h-5 w-5 text-omniv-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold tracking-tight">
                  {c.city}
                </p>
                <p className="text-[11px] text-omniv-text-muted">
                  {c.fans} fans ·{" "}
                  <span className="text-omniv-gold">{c.ready} ready</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "roster" && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {roster.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-omniv-border px-4 py-10 text-center text-[12px] text-omniv-text-muted">
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
                className="rounded-2xl border border-omniv-border bg-omniv-card p-3.5"
              >
                <p className="text-[14px] font-semibold">{r.stage_name}</p>
                <p className="mt-0.5 text-[11px] text-omniv-text-muted">
                  {r.genre || "—"} · {r.slug}
                </p>
              </div>
            ))}
        </div>
      )}
    </AppShell>
  );
}
