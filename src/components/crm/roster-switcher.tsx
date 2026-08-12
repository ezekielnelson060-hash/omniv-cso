"use client";

import { useEffect, useState } from "react";
import { useRoster } from "@/lib/roster-context";
import { usePlan } from "@/components/billing/plan-provider";
import { rosterLimitForPlan } from "@/lib/roster-limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Users, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export function RosterSwitcher() {
  const { artists, active, setActiveId, loading, refresh } = useRoster();
  const { plan } = usePlan();
  const max = rosterLimitForPlan(plan);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addArtist() {
    if (!name.trim()) return;
    if (artists.length >= max) {
      setErr(`Limit is ${max} on ${plan}. Upgrade to expand roster.`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageName: name.trim(), genre: genre.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error || "Could not add artist");
        return;
      }
      setName("");
      setGenre("");
      setOpen(false);
      await refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  const atLimit = artists.length >= max;

  return (
    <div className="rounded-2xl border border-omniv-border bg-omniv-elevated/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-omniv-gold" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Roster · {artists.length}/{max}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-[11px]"
          disabled={atLimit}
          onClick={() => setOpen((v) => !v)}
        >
          <Plus className="h-3 w-3" />
          Add artist
        </Button>
      </div>

      {atLimit && (
        <p className="mb-2 text-[11px] text-omniv-text-muted">
          Roster full on {plan}.{" "}
          <Link href="/settings?tab=billing" className="text-omniv-gold underline-offset-2 hover:underline">
            Upgrade for more slots
          </Link>
        </p>
      )}

      {loading && artists.length === 0 ? (
        <p className="text-[12px] text-omniv-text-muted">Loading roster…</p>
      ) : artists.length === 0 ? (
        <p className="text-[12px] text-omniv-text-muted">
          No artists yet — add one or create a tip link in Money.
        </p>
      ) : (
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
          {artists.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveId(a.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                active?.id === a.id
                  ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                  : "border-omniv-border text-omniv-text-secondary hover:border-omniv-gold/30"
              )}
            >
              {a.stage_name}
              {a.genre ? (
                <span className="ml-1 opacity-60">· {a.genre}</span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {open && !atLimit && (
        <div className="mt-3 space-y-2 border-t border-omniv-border pt-3">
          <Input
            placeholder="Stage name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Genre (optional)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          {err && <p className="text-xs text-omniv-danger">{err}</p>}
          <Button
            size="sm"
            className="gap-1.5"
            disabled={busy || !name.trim()}
            onClick={() => void addArtist()}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Save to roster
          </Button>
        </div>
      )}
    </div>
  );
}
