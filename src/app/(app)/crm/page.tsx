"use client";

import { AppShell } from "@/components/layout/app-shell";
import { CrmPanel } from "@/components/crm/crm-panel";
import { RosterSwitcher } from "@/components/crm/roster-switcher";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function CrmPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manager CRM</h1>
          <p className="text-sm text-omniv-text-secondary">
            Switch artists, own the fan list, tasks and notes. Multi-artist ops.
          </p>
        </div>
        <Link href="/label">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-omniv-gold" />
            Label dashboard
          </Button>
        </Link>
      </div>
      <FeatureGate
        feature="crm"
        currentPlan={plan}
        mode="hard"
        onPlanChange={setPlan}
      >
        <div className="mb-5">
          <RosterSwitcher />
        </div>
        <CrmPanel />
      </FeatureGate>
    </AppShell>
  );
}
