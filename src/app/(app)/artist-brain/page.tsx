"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BrainView } from "@/components/artist-brain/brain-view";

export default function ArtistBrainPage() {
  return (
    <AppShell>
      <div className="mb-3">
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Strategy
        </p>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Artist Brain
        </h1>
        <p className="text-[11px] text-omniv-text-muted">
          Big dream, stage, and the levers we hold you to
        </p>
      </div>
      <BrainView />
    </AppShell>
  );
}
