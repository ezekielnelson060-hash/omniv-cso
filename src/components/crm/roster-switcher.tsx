"use client";

import { useRoster } from "@/lib/roster-context";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export function RosterSwitcher() {
  const { artists, active, setActiveId, loading } = useRoster();

  if (loading) {
    return (
      <p className="text-xs text-omniv-text-muted">Loading roster…</p>
    );
  }

  if (artists.length === 0) {
    return (
      <p className="text-xs text-omniv-text-muted">
        No roster artists yet — add one in Supabase or via onboarding slug.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-omniv-border bg-omniv-elevated/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-omniv-gold" />
        <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
          Active artist
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
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
      {active && (
        <p className="mt-2 font-data text-[10px] text-omniv-text-muted">
          Gate: /f/{active.slug}
        </p>
      )}
    </div>
  );
}
