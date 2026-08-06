"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import {
  FEATURE_LABELS,
  hasFeature,
  minPlanFor,
  type FeatureId,
  type PlanId,
} from "@/lib/billing";
import { Lock, Sparkles } from "lucide-react";

interface FeatureGateProps {
  feature: FeatureId;
  currentPlan: PlanId;
  children: ReactNode;
  mode?: "soft" | "hard";
  onPlanChange?: (plan: PlanId) => void;
}

export function FeatureGate({
  feature,
  currentPlan,
  children,
  mode = "soft",
  onPlanChange,
}: FeatureGateProps) {
  const [open, setOpen] = useState(false);
  const allowed = hasFeature(currentPlan, feature);
  const target = minPlanFor(feature);

  if (allowed) return <>{children}</>;

  return (
    <>
      {mode === "hard" ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-omniv-gold/15">
            <Lock className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <Badge variant="gold">{target.name}+</Badge>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              {FEATURE_LABELS[feature]} is locked
            </h2>
            <p className="mt-1 max-w-md text-sm text-omniv-text-secondary">
              You do not have this layer yet. {target.name} operators do.
              Free is intentionally thinner.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            See what unlocks
          </Button>
        </Card>
      ) : (
        <div className="relative">
          <div className="pointer-events-none select-none opacity-40 blur-[2px]">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-omniv-black via-omniv-black/80 to-transparent p-6">
            <Card className="max-w-sm border-omniv-gold/30 p-6 text-center shadow-[0_0_40px_-8px_rgba(212,175,55,0.3)]">
              <Lock className="mx-auto h-5 w-5 text-omniv-gold" />
              <p className="mt-2 text-sm font-medium text-omniv-text">
                {FEATURE_LABELS[feature]}
              </p>
              <p className="mt-1 text-xs text-omniv-text-muted">
                {target.name}+ only · ${target.priceMonthly}/mo. Upgrade or stay limited.
              </p>
              <Button
                size="sm"
                className="mt-4 gap-1.5"
                onClick={() => setOpen(true)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Unlock this
              </Button>
            </Card>
          </div>
        </div>
      )}

      <UpgradeModal
        open={open}
        feature={feature}
        currentPlan={currentPlan}
        onClose={() => setOpen(false)}
        onSelectPlan={(p) => {
          onPlanChange?.(p);
          setOpen(false);
        }}
      />
    </>
  );
}
