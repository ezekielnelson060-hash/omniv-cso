"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SimulatorPanel } from "@/components/release/simulator-panel";
import { PredictiveCalendar } from "@/components/release/predictive-calendar";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ReleaseSimulatorPage() {
  const { plan, setPlan } = usePlan();
  return (
    <AppShell>
      <div className="relative -mx-3 mb-3 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/12 via-omniv-gold/8 to-transparent" />
        <div className="relative flex flex-col gap-3 px-3 pb-3 pt-1 sm:flex-row sm:items-end sm:justify-between sm:px-4 md:px-5 md:pt-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
              Studio
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              Release
            </h1>
            <p className="mt-1 max-w-lg text-[13px] text-omniv-text-secondary">
              Pick a drop window. See what content to post before the date.
              Connect the plan to your catalogue and tip link so the release can
              make money.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/content"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-omniv-border px-3 text-[12px] font-medium hover:border-omniv-gold/40"
            >
              Content & sounds
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/crm?tab=money"
              className="inline-flex h-9 items-center rounded-full bg-omniv-gold px-3 text-[12px] font-semibold text-black"
            >
              Tip link
            </Link>
          </div>
        </div>
      </div>
      <FeatureGate
        feature="release_simulator"
        currentPlan={plan}
        mode="hard"
        onPlanChange={setPlan}
      >
        <div className="space-y-4">
          <SimulatorPanel />
          <PredictiveCalendar />
        </div>
      </FeatureGate>
    </AppShell>
  );
}
