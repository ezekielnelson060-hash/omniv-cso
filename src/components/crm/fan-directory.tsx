"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Users, Search, RefreshCw, Link2 } from "lucide-react";

type RosterArtist = {
  id: string;
  stage_name: string;
  slug: string;
  genre: string | null;
};

type Fan = {
  id: string;
  email: string;
  first_name: string | null;
  city: string | null;
  country_code: string | null;
  acquisition_source: string | null;
  fan_tier: string | null;
  engagement_score: number | null;
  created_at: string;
  last_active_at: string | null;
};

type Interaction = {
  id: string;
  action_type: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

export function FanDirectory() {
  const [artists, setArtists] = useState<RosterArtist[]>([]);
  const [artistId, setArtistId] = useState<string>("");
  const [fans, setFans] = useState<Fan[]>([]);
  const [selected, setSelected] = useState<Fan | null>(null);
  const [timeline, setTimeline] = useState<Interaction[]>([]);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const loadArtists = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setMsg("Connect Supabase to load roster fans.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug, genre")
      .order("stage_name");
    if (error) {
      setMsg(
        error.message.includes("relation")
          ? "Run migration 005_multi_tenant_fans.sql in Supabase first."
          : error.message
      );
      setLoading(false);
      return;
    }
    const list = (data || []) as RosterArtist[];
    setArtists(list);
    if (list[0] && !artistId) setArtistId(list[0].id);
    setLoading(false);
  }, [artistId]);

  const loadFans = useCallback(async (aid: string) => {
    if (!aid || !isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fans")
      .select(
        "id, email, first_name, city, country_code, acquisition_source, fan_tier, engagement_score, created_at, last_active_at"
      )
      .eq("artist_id", aid)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setMsg(error.message);
      return;
    }
    setFans((data || []) as Fan[]);
    setSelected(null);
    setTimeline([]);
  }, []);

  useEffect(() => {
    void loadArtists();
  }, [loadArtists]);

  useEffect(() => {
    if (artistId) void loadFans(artistId);
  }, [artistId, loadFans]);

  async function openFan(f: Fan) {
    setSelected(f);
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("fan_interactions")
      .select("id, action_type, created_at, metadata")
      .eq("fan_id", f.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setTimeline((data || []) as Interaction[]);
  }

  const filtered = useMemo(() => {
    return fans.filter((f) => {
      if (tier !== "all" && f.fan_tier !== tier) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        f.email.toLowerCase().includes(s) ||
        (f.city || "").toLowerCase().includes(s) ||
        (f.first_name || "").toLowerCase().includes(s)
      );
    });
  }, [fans, q, tier]);

  const active = artists.find((a) => a.id === artistId);
  const gateUrl =
    typeof window !== "undefined" && active
      ? `${window.location.origin}/f/${active.slug}`
      : active
        ? `/f/${active.slug}`
        : "";

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-omniv-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Fan directory</h3>
          <Badge variant="outline">{fans.length} owned</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="h-9 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
          >
            {artists.length === 0 && (
              <option value="">No roster artists yet</option>
            )}
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.stage_name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => {
              void loadArtists();
              if (artistId) void loadFans(artistId);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {msg && (
        <p className="border-b border-omniv-border px-4 py-2 text-xs text-omniv-text-muted">
          {msg}
        </p>
      )}

      {active && (
        <div className="flex flex-wrap items-center gap-2 border-b border-omniv-border bg-omniv-elevated/40 px-4 py-2 text-xs text-omniv-text-secondary">
          <Link2 className="h-3.5 w-3.5 text-omniv-gold" />
          Gate link:{" "}
          <a
            href={gateUrl}
            target="_blank"
            rel="noreferrer"
            className="font-data text-omniv-gold hover:underline"
          >
            /f/{active.slug}
          </a>
          <span className="text-omniv-text-muted">
            · share in Instagram / TikTok bio
          </span>
        </div>
      )}

      <div className="grid min-h-[320px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="border-b border-omniv-border lg:border-b-0 lg:border-r">
          <div className="flex gap-2 border-b border-omniv-border p-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-omniv-text-muted" />
              <Input
                className="pl-8"
                placeholder="Search email or city…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
            >
              <option value="all">All tiers</option>
              <option value="Superfan">Superfan</option>
              <option value="Core Fan">Core Fan</option>
              <option value="Casual">Casual</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
          <ul className="max-h-[420px] overflow-y-auto">
            {loading && (
              <li className="px-4 py-8 text-center text-xs text-omniv-text-muted">
                Loading…
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-omniv-text-muted">
                No fans yet. Share the gate link above.
              </li>
            )}
            {filtered.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => void openFan(f)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 border-b border-omniv-border/60 px-4 py-3 text-left transition-colors",
                    selected?.id === f.id
                      ? "bg-omniv-gold/10"
                      : "hover:bg-white/[0.03]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {f.first_name || f.email}
                    </p>
                    <p className="truncate text-[11px] text-omniv-text-muted">
                      {f.city || "—"}
                      {f.country_code ? `, ${f.country_code}` : ""} ·{" "}
                      {f.acquisition_source || "unknown"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      f.fan_tier === "Superfan"
                        ? "gold"
                        : f.fan_tier === "Core Fan"
                          ? "success"
                          : "outline"
                    }
                  >
                    {f.fan_tier || "Casual"}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          {!selected ? (
            <p className="py-16 text-center text-xs text-omniv-text-muted">
              Select a fan to open their profile & timeline
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold">
                  {selected.first_name || selected.email}
                </h4>
                <p className="text-sm text-omniv-text-secondary">
                  {selected.email}
                </p>
                <p className="mt-1 text-xs text-omniv-text-muted">
                  {selected.city || "Location unknown"}
                  {selected.country_code ? ` · ${selected.country_code}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="gold">{selected.fan_tier}</Badge>
                  <Badge variant="outline">
                    Score {selected.engagement_score ?? 0}
                  </Badge>
                  <Badge variant="outline">
                    {selected.acquisition_source || "source?"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                  Activity timeline
                </p>
                <ul className="mt-2 space-y-2">
                  {timeline.length === 0 && (
                    <li className="text-xs text-omniv-text-muted">
                      No interactions logged yet.
                    </li>
                  )}
                  {timeline.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-lg border border-omniv-border/60 bg-omniv-elevated/40 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-omniv-text">
                        {t.action_type}
                      </span>
                      <span className="ml-2 text-omniv-text-muted">
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
