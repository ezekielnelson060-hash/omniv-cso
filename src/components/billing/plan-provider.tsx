"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PLAN,
  hasFeature,
  type FeatureId,
  type PlanId,
} from "@/lib/billing";
import { UpgradeModal } from "@/components/billing/upgrade-modal";

interface PlanContextValue {
  plan: PlanId;
  setPlan: (p: PlanId) => void;
  can: (feature: FeatureId) => boolean;
  require: (feature: FeatureId) => boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanId>(DEFAULT_PLAN);
  const [gateFeature, setGateFeature] = useState<FeatureId | null>(null);

  const can = useCallback(
    (feature: FeatureId) => hasFeature(plan, feature),
    [plan]
  );

  const require = useCallback(
    (feature: FeatureId) => {
      if (hasFeature(plan, feature)) return true;
      setGateFeature(feature);
      return false;
    },
    [plan]
  );

  const value = useMemo(
    () => ({ plan, setPlan, can, require }),
    [plan, can, require]
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      {gateFeature && (
        <UpgradeModal
          open={!!gateFeature}
          feature={gateFeature}
          currentPlan={plan}
          onClose={() => setGateFeature(null)}
          onSelectPlan={(p) => {
            setPlan(p);
            setGateFeature(null);
          }}
        />
      )}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within PlanProvider");
  }
  return ctx;
}
