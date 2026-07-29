"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-omniv-text-secondary">
          Profile, team, billing (Flutterwave), integrations, notifications, API
        </p>
      </div>
      <SettingsPanel />
    </AppShell>
  );
}
