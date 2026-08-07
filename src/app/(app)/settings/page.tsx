"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { PayoutAndPhoto } from "@/components/settings/payout-and-photo";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-omniv-text-secondary">
          Photo, payout, profile, surfaces, billing
        </p>
      </div>
      <PayoutAndPhoto />
      <Suspense
        fallback={
          <p className="text-sm text-omniv-text-muted">Loading settings…</p>
        }
      >
        <SettingsPanel />
      </Suspense>
    </AppShell>
  );
}
