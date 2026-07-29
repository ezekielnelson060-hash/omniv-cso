"use client";

import { AppShell } from "@/components/layout/app-shell";
import { IntelligencePanel } from "@/components/content/intelligence-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";

export default function ContentPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Content Intelligence
        </h1>
        <p className="text-sm text-omniv-text-secondary">
          Analyse hooks and retention, predict viral performance, generate
          brand-matched studio copy
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
