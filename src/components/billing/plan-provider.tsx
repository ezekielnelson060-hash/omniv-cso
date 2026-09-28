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
  return (
    v === "free" ||
    v === "starter" ||
    v === "pro" ||
    v === "business" ||
    v === "label"
  );
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
        .select("plan, plan_status, billing_status, plan_expires_at")
        .eq("id", user.id)
        .maybeSingle();

      const status = data?.plan_status || data?.billing_status || "none";
      let dbPlan = data?.plan as string | undefined;
      if (dbPlan === "label") dbPlan = "business";
      if (dbPlan === "starter") dbPlan = "pro";
      const expiresAt = data?.plan_expires_at
        ? new Date(data.plan_expires_at).getTime()
        : null;
      const entitlementActive =
        (status === "active" || status === "cancelled") &&
        (expiresAt === null ||
          Number.isNaN(expiresAt) ||
          expiresAt > Date.now());

      if (isPlanId(dbPlan) && dbPlan !== "free") {
        if (entitlementActive) {
          setPlanState(dbPlan);
          setPlanStatus("active");
        } else {
          setPlanState(DEFAULT_PLAN);
          setPlanStatus(status);
        }
      } else {
        setPlanState(DEFAULT_PLAN);
        setPlanStatus(status);
      }
    } catch {
      setPlanState(DEFAULT_PLAN);
      setPlanStatus("none");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPlan();
  }, [refreshPlan]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      const id = window.setInterval(() => {
        void refreshPlan();
      }, 1500);
      return () => window.clearInterval(id);
    }
  }, [refreshPlan]);

  const setPlan = useCallback((p: PlanId) => {
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
    () => ({
      plan,
      planStatus,
      loading,
      setPlan,
      can,
      require,
      refreshPlan,
    }),
    [plan, planStatus, loading, setPlan, can, require, refreshPlan]
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      {gateFeature ? (
        <UpgradeModal
          open
          feature={gateFeature}
          currentPlan={plan}
          onClose={() => setGateFeature(null)}
        />
      ) : null}
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
