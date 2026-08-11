"use client";

import { AppShell } from "@/components/layout/app-shell";
import { IntelligencePanel } from "@/components/content/intelligence-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";

export default function ContentPage() {
  const { plan, setPlan } = usePlan();
  return (
    <AppShell>
      <div className="relative -mx-3 mb-3 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/12 via-omniv-gold/8 to-transparent" />
        <div className="relative px-3 pb-3 pt-1 sm:px-4 md:px-5 md:pt-4">
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            Studio
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Content
          </h1>
          <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
            Trending angles for your genre, analyse clips, ship scripts — then
            lock the release.
          </p>
        </div>
      </div>
      <FeatureGate
        feature="content_intelligence"
        currentPlan={plan}
        mode="hard"
        onPlanChange={setPlan}
      >
        <IntelligencePanel />
      </FeatureGate>
    </AppShell>
  );
}
