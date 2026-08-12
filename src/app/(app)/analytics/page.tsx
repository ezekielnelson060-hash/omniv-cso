"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DspMetricsRefresh } from "@/components/progress/dsp-metrics-refresh";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Progress: DSP popularity pull for Agent outside signals.
 * Scoreboard tiles restored in follow-up if needed.
 */
export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            Progress
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Your scores
          </h1>
          <p className="mt-1 text-[12px] text-omniv-text-secondary">
            Pull Spotify popularity so Agent has real outside signals. Add
            Spotify links in Catalogue first.
          </p>
        </div>
        <DspMetricsRefresh hasSpotifyLinks />
        <div className="flex flex-wrap gap-2">
          <Button className="h-10 rounded-xl" asChild>
            <Link href="/opportunities">Open Moves</Link>
          </Button>
          <Button variant="outline" className="h-10 rounded-xl" asChild>
            <Link href="/crm">Command Center</Link>
          </Button>
          <Button variant="outline" className="h-10 rounded-xl" asChild>
            <Link href="/catalogue">Catalogue · DSP links</Link>
          </Button>
          <Button variant="outline" className="h-10 rounded-xl" asChild>
            <Link href="/notifications">Open Agent</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
