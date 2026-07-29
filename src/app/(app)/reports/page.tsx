"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ReportsPanel } from "@/components/reports/reports-panel";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-omniv-text-secondary">
          Investor, artist, campaign, monthly growth, and label PDF briefings
        </p>
      </div>
      <ReportsPanel />
    </AppShell>
  );
}
