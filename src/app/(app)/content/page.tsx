"use client";

import { AppShell } from "@/components/layout/app-shell";
import { IntelligencePanel } from "@/components/content/intelligence-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";

export default function ContentPage() {
  const { plan, setPlan } = usePlan();
  return (
    <AppShell>
      <div className="mb-3">
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Studio
        </p>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Content
        </h1>
        <p className="text-[11px] text-omniv-text-muted">
          Intelligence on what to ship, not a content calendar dump
        </p>
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
