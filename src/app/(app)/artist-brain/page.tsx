"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BrainView } from "@/components/artist-brain/brain-view";

export default function ArtistBrainPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Artist Brain</h1>
        <p className="text-sm text-omniv-text-secondary">
          Edit the memory that drives scores, Opportunity Feed, and Ziki. Save
          when positioning changes.
        </p>
      </div>
      <BrainView />
    </AppShell>
  );
}
