"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SimulatorPanel } from "@/components/release/simulator-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";

export default function ReleaseSimulatorPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Release Simulator
        </h1>
        <p className="text-sm text-omniv-text-secondary">
          Upload unreleased audio or video — get commercial potential, timing,
          risk, and a full launch strategy
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
