"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  loadLabel,
  saveLabel,
  type LabelWorkspace,
  type ManagedArtist,
} from "@/lib/workspace-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { RosterSwitcher } from "@/components/crm/roster-switcher";
import { cn, scoreColor } from "@/lib/utils";
import { Building2, Plus, MessageSquare, TrendingUp, Users } from "lucide-react";

type CrossRow = {
  id: string;
  stage_name: string;
  slug: string;
  genre: string | null;
  fans: number;
  superfans: number;
};

export function LabelPanel() {
  const [ws, setWs] = useState<LabelWorkspace>({ name: "", artists: [] });
  const [artistName, setArtistName] = useState("");
  const [listeners, setListeners] = useState("");
  const [genre, setGenre] = useState("");
  const [cross, setCross] = useState<CrossRow[]>([]);
  const [totalFans, setTotalFans] = useState(0);

  useEffect(() => {
    setWs(loadLabel());
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    void (async () => {
      const { data: roster } = await supabase
        .from("roster_artists")
        .select("id, stage_name, slug, genre")
        .order("stage_name");
      const list = roster || [];
      const rows: CrossRow[] = [];
      let fansSum = 0;
      for (const a of list) {
        const [all, sf] = await Promise.all([
          supabase
            .from("fans")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", a.id),
          supabase
            .from("fans")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", a.id)
            .eq("fan_tier", "Superfan"),
        ]);
        const fans = all.count ?? 0;
        fansSum += fans;
        rows.push({
          id: a.id,
          stage_name: a.stage_name,
          slug: a.slug,
          genre: a.genre,
          fans,
          superfans: sf.count ?? 0,
        });
      }
      rows.sort((a, b) => b.fans - a.fans);
      setCross(rows);
      setTotalFans(fansSum);
    })();
  }, []);

  function persist(next: LabelWorkspace) {
    setWs(next);
    saveLabel(next);
  }

  function saveName(name: string) {
    persist({ ...ws, name });
  }

  function addRosterArtist() {
    if (!artistName.trim()) return;
    const listenersN = Number(listeners) || 0;
    const row: ManagedArtist = {
      id: `${Date.now()}`,
      name: artistName.trim(),
      genre: genre.trim() || "TBD",
      stage: "emerging",
      monthlyListeners: listenersN,
      score: Math.min(
        95,
        35 + Math.round(Math.log10(Math.max(10, listenersN)) * 12)
      ),
    };
    persist({ ...ws, artists: [row, ...ws.artists] });
    setArtistName("");
    setListeners("");
    setGenre("");
  }

  const totalListeners = ws.artists.reduce((a, r) => a + r.monthlyListeners, 0);
  const avgScore =
    ws.artists.length === 0
      ? 0
      : Math.round(
          ws.artists.reduce((a, r) => a + r.score, 0) / ws.artists.length
        );
  const sorted = [...ws.artists].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-5">
      <div className="glass-gold glow-gold rounded-[var(--radius-xl)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-omniv-gold/20">
              <Building2 className="h-5 w-5 text-omniv-gold" />
            </div>
            <div className="flex-1">
              <Badge variant="gold">Label portfolio</Badge>
              <Input
                className="mt-2 max-w-sm border-omniv-gold/20 bg-transparent text-xl font-semibold"
                placeholder="Your label name"
                value={ws.name}
                onChange={(e) => saveName(e.target.value)}
              />
              <p className="mt-1 text-sm text-omniv-text-secondary">
                Cross-roster owned fans + strategy comparison — no demo acts.
              </p>
            </div>
          </div>
          <Link href="/ziki">
            <Button size="sm" variant="outline" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Ziki for label
            </Button>
          </Link>
        </div>
      </div>

      <RosterSwitcher />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Roster (live)
          </p>
          <p className="mt-1 font-data text-2xl font-semibold">{cross.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Owned fans (all)
          </p>
          <p className="mt-1 font-data text-2xl font-semibold text-omniv-gold">
            {totalFans.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Strategy artists
          </p>
          <p className="mt-1 font-data text-2xl font-semibold">
            {ws.artists.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Avg strategy score
          </p>
          <p className={cn("mt-1 font-data text-2xl font-semibold", scoreColor(avgScore))}>
            {avgScore || "—"}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Cross-roster owned audience</h3>
        </div>
        {cross.length === 0 ? (
          <p className="text-xs text-omniv-text-muted">
            No live roster_artists rows yet — add artists with slugs for fan gates.
          </p>
        ) : (
          <div className="space-y-3">
            {cross.map((a) => (
              <div key={a.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-omniv-text-secondary">
                    {a.stage_name}
                    {a.genre ? (
                      <span className="text-omniv-text-muted"> · {a.genre}</span>
                    ) : null}
                  </span>
                  <span className="font-data text-omniv-gold">
                    {a.fans} fans · {a.superfans} SF
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-omniv-gold"
                    style={{
                      width: `${Math.min(100, totalFans ? (a.fans / totalFans) * 100 : 0)}%`,
                    }}
                  />
                </div>
                <p className="mt-0.5 font-data text-[10px] text-omniv-text-muted">
                  /f/{a.slug}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium">Add strategy artist (local)</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Artist name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
          />
          <Input
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <Input
            placeholder="Monthly listeners"
            type="number"
            value={listeners}
            onChange={(e) => setListeners(e.target.value)}
          />
          <Button onClick={addRosterArtist} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Strategy score comparison</h3>
        </div>
        {sorted.length === 0 ? (
          <p className="text-xs text-omniv-text-muted">
            Empty strategy list — add artists above.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((a) => (
              <div key={a.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-omniv-text-secondary">{a.name}</span>
                  <span className={cn("font-data font-medium", scoreColor(a.score))}>
                    {a.score} · {a.monthlyListeners.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-omniv-gold"
                    style={{ width: `${a.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
