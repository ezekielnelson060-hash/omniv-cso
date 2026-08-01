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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const [gateFeature, setGateFeature] = useState<FeatureId | null>(null);

  const refreshPlan = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPlanState(DEFAULT_PLAN);
        setPlanStatus("none");
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("plan, plan_status, billing_status")
        .eq("id", user.id)
        .maybeSingle();

      const status = data?.plan_status || data?.billing_status || "none";
      const dbPlan = data?.plan;

      // Paid plans only stick when backend marked active (webhook)
      if (isPlanId(dbPlan) && dbPlan !== "free") {
        if (status === "active") {
          setPlanState(dbPlan);
          setPlanStatus("active");
        } else {
          // Payment pending / failed — stay free for gating
          setPlanState(DEFAULT_PLAN);
          setPlanStatus(status);
        }
      } else if (isPlanId(dbPlan)) {
        setPlanState("free");
        setPlanStatus(status);
      } else {
        setPlanState(DEFAULT_PLAN);
        setPlanStatus(status);
      }
    } catch {
      /* keep default */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPlan();
  }, [refreshPlan]);

  // After Flutterwave redirect: ?billing=success
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      // Webhook may lag a few seconds — poll briefly
      let n = 0;
      const id = window.setInterval(() => {
        void refreshPlan();
        n += 1;
        if (n >= 8) window.clearInterval(id);
      }, 1500);
      return () => window.clearInterval(id);
    }
  }, [refreshPlan]);

  const setPlan = useCallback((p: PlanId) => {
    // Optimistic free only — paid plans come from webhook/DB
    if (p === "free") setPlanState("free");
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
    () => ({ plan, planStatus, loading, setPlan, can, require, refreshPlan }),
    [plan, planStatus, loading, setPlan, can, require, refreshPlan]
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
