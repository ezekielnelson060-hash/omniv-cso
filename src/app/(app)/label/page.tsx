"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { LabelPanel } from "@/components/crm/label-panel";
import { Button } from "@/components/ui/button";
import { Compass, Users } from "lucide-react";

export default function LabelPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="relative -mx-3 mb-4 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-omniv-gold/8 to-transparent" />
        <div className="absolute -left-8 top-0 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 px-3 pb-4 pt-1 sm:flex-row sm:items-end sm:justify-between sm:px-4 md:px-5 md:pt-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
              Label
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              Roster
            </h1>
            <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
              Multi-artist workspace — switch roster, share gates, run A&R from
              one desk.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/discover">
              <Button
                variant="outline"
                className="h-10 gap-1.5 rounded-xl px-4 text-[12px]"
              >
                <Compass className="h-4 w-4" />
                A&R board
              </Button>
            </Link>
            <Link href="/crm">
              <Button
                variant="outline"
                className="h-10 gap-1.5 rounded-xl px-4 text-[12px]"
              >
                <Users className="h-4 w-4" />
                CRM
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <FeatureGate
        feature="label_dashboard"
        currentPlan={plan}
        mode="hard"
        onPlanChange={setPlan}
      >
        <LabelPanel />
      </FeatureGate>
    </AppShell>
  );
}
