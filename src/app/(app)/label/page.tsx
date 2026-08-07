"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { FeatureGate } from "@/components/billing/feature-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { LabelPanel } from "@/components/crm/label-panel";
import { PageChrome } from "@/components/ui/page-chrome";
import { Button } from "@/components/ui/button";
import { Compass, Users } from "lucide-react";

export default function LabelPage() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <PageChrome
        eyebrow="Label"
        title="Roster"
        actions={
          <>
            <Link href="/discover">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[11px]"
              >
                <Compass className="h-3 w-3" />
                A&R board
              </Button>
            </Link>
            <Link href="/crm">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[11px]"
              >
                <Users className="h-3 w-3" />
                CRM
              </Button>
            </Link>
          </>
        }
      />
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
