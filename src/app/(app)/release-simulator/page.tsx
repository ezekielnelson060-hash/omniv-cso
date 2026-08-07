"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SimulatorPanel } from "@/components/release/simulator-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";

export default function ReleaseSimulatorPage() {
  const { plan, setPlan } = usePlan();
  return (
    <AppShell>
      <div className="mb-3">
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Studio
        </p>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Release
        </h1>
        <p className="text-[11px] text-omniv-text-muted">
          Stress-test timing before you burn the window
        </p>
      </div>
      <FeatureGate
        feature="release_simulator"
        currentPlan={plan}
        mode="hard"
        onPlanChange={setPlan}
      >
        <SimulatorPanel />
      </FeatureGate>
    </AppShell>
  );
}
