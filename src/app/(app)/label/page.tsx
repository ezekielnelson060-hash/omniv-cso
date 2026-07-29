"use client";

import { AppShell } from "@/components/layout/app-shell";
import { LabelPanel } from "@/components/crm/label-panel";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function LabelPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Label Dashboard
          </h1>
          <p className="text-sm text-omniv-text-secondary">
            Portfolio, managers, artist comparison, campaigns, and AI insights
          </p>
        </div>
        <Link href="/crm">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Users className="h-3.5 w-3.5 text-omniv-gold" />
            Manager CRM
          </Button>
        </Link>
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
