"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ReportsPanel } from "@/components/reports/reports-panel";
import { PressKitPanel } from "@/components/press/press-kit-panel";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="mb-3">
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Org
        </p>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Reports
        </h1>
        <p className="text-[11px] text-omniv-text-muted">
          Investor, artist, campaign, growth
        </p>
      </div>
      <div className="space-y-3">
        <PressKitPanel />
        <ReportsPanel />
      </div>
    </AppShell>
  );
}
