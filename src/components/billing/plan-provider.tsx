"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface PlanContextValue {
  plan: PlanId;
  planStatus: string;
  setPlan: (p: PlanId) => void;
  can: (feature: FeatureId) => boolean;
  require: (feature: FeatureId) => boolean;
  refreshPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

function isPlanId(v: string | null | undefined): v is PlanId {
  return v === "free" || v === "starter" || v === "pro" || v === "label";
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<PlanId>(DEFAULT_PLAN);
  const [planStatus, setPlanStatus] = useState("none");
  const [gateFeature, setGateFeature] = useState<FeatureId | null>(null);

  const refreshPlan = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, plan_status")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.plan && isPlanId(data.plan) && data.plan_status === "active") {
        setPlanState(data.plan);
        setPlanStatus("active");
      } else if (data?.plan && isPlanId(data.plan) && data.plan === "free") {
        setPlanState("free");
        setPlanStatus(data.plan_status || "none");
      } else {
        setPlanState(DEFAULT_PLAN);
        setPlanStatus(data?.plan_status || "none");
      }
    } catch {
      /* keep default */
    }
  }, []);

  useEffect(() => {
    void refreshPlan();
  }, [refreshPlan]);

  const setPlan = useCallback((p: PlanId) => {
    // Optimistic UI only — paid plans stick after webhook confirms
    setPlanState(p);
  }, []);

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
    () => ({ plan, planStatus, setPlan, can, require, refreshPlan }),
    [plan, planStatus, setPlan, can, require, refreshPlan]
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
