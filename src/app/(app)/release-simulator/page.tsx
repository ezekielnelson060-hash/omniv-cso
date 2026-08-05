"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SimulatorPanel } from "@/components/release/simulator-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { ExecutionTasks } from "@/components/execution/execution-tasks";

export default function ReleaseSimulatorPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Release Simulator
        </h1>
        <p className="text-sm text-omniv-text-secondary">
          Stress-test timing and positioning before you burn a release window, not after the ads are gone.
        </p>
      </div>
      <FeatureGate
        feature="release_simulator"
        currentPlan={plan}
        mode="hard"
        onPlanChange={setPlan}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SimulatorPanel />
          </div>
          <div>
            <ExecutionTasks />
          </div>
        </div>
      </FeatureGate>
    </AppShell>
  );
}
