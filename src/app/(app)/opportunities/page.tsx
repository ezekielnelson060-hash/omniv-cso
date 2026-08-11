"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MovesPanel } from "@/components/moves/moves-panel";

/** Moves = precision plan. Agent = intelligence at /notifications. */
export default function OpportunitiesPage() {
  return (
    <AppShell>
      <MovesPanel />
    </AppShell>
  );
}
