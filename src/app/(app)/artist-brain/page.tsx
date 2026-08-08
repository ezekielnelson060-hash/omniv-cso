"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BrainView } from "@/components/artist-brain/brain-view";

export default function ArtistBrainPage() {
  return (
    <AppShell>
      <BrainView />
    </AppShell>
  );
}
