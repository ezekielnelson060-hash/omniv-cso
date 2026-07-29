"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HelpPanel } from "@/components/help/help-panel";

export default function HelpPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Help Centre</h1>
        <p className="text-sm text-omniv-text-secondary">
          Tour, walkthroughs, FAQ — what Omniv does and what to do next
        </p>
      </div>
      <HelpPanel />
    </AppShell>
  );
}
