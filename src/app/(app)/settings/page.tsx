"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { PayoutAndPhoto } from "@/components/settings/payout-and-photo";
import { ThemeToggleCard } from "@/components/settings/theme-toggle";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="relative -mx-3 mb-5 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/12 via-omniv-gold/8 to-transparent" />
        <div className="absolute -right-10 top-0 h-36 w-36 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="relative px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            Account
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
            Appearance, photo, payout, profile, linked surfaces, and billing.
          </p>
        </div>
      </div>
      <ThemeToggleCard />
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
