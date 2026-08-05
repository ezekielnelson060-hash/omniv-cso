"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FEATURE_LABELS,
  PLANS,
  minPlanFor,
  type FeatureId,
  type PlanId,
} from "@/lib/billing";
import { startFlutterwaveCheckout, type CheckoutPlan } from "@/lib/checkout";
import { cn } from "@/lib/utils";
import { X, Sparkles, Check, CreditCard, Loader2 } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  feature: FeatureId;
  currentPlan: PlanId;
  onClose: () => void;
  onSelectPlan?: (plan: PlanId) => void;
}

export function UpgradeModal({
  open,
  feature,
  currentPlan,
  onClose,
}: UpgradeModalProps) {
  const target = minPlanFor(feature);
  const featureLabel = FEATURE_LABELS[feature];
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const upgradeOptions = PLANS.filter(
    (p) => p.id !== "free" && p.priceMonthly >= target.priceMonthly
  );

  async function pay(planId: PlanId) {
    if (planId === "free") return;
    setBusy(planId);
    setError(null);
    const res = await startFlutterwaveCheckout({
      plan: planId as CheckoutPlan,
    });
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    // Do NOT unlock plan here. webhook must confirm
    window.location.href = res.link;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg animate-fade-in-up rounded-[var(--radius-xl)] border border-omniv-gold/30 bg-omniv-card p-6 shadow-[0_0_60px_-12px_rgba(212,175,55,0.35)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-omniv-text-muted hover:bg-white/5 hover:text-omniv-text"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omniv-gold/15">
            <Sparkles className="h-5 w-5 text-omniv-gold" />
          </div>
          <Badge variant="gold">Access required</Badge>
        </div>

        <h2
          id="upgrade-title"
          className="mt-3 text-xl font-semibold tracking-tight text-omniv-text"
        >
          {featureLabel} is not on your tier
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-omniv-text-secondary">
          You&apos;re on{" "}
          <span className="text-omniv-gold">{planName(currentPlan)}</span>.{" "}
          <strong className="font-medium text-omniv-text">{featureLabel}</strong>{" "}
          is part of the intelligence stack from{" "}
          <span className="text-omniv-gold">{target.name}</span>. Payment confirms
          via Flutterwave before access opens. No soft unlocks.
        </p>

        <div className="mt-5 space-y-2">
          {upgradeOptions.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={busy !== null}
              onClick={() => void pay(p.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-all",
                p.highlighted
                  ? "border-omniv-gold/40 bg-omniv-gold/10"
                  : "border-omniv-border bg-omniv-elevated/40 hover:border-omniv-gold/25"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-omniv-text">
                    {p.name}
                  </span>
                  {p.highlighted && <Badge variant="gold">Recommended</Badge>}
                </div>
                <p className="text-[11px] text-omniv-text-muted">{p.blurb}</p>
              </div>
              <div className="text-right">
                {busy === p.id ? (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin text-omniv-gold" />
                ) : (
                  <>
                    <p className="font-data text-lg font-semibold text-omniv-text">
                      ${p.priceMonthly}
                      <span className="text-xs font-normal text-omniv-text-muted">
                        /mo
                      </span>
                    </p>
                    <p className="text-[10px] text-omniv-text-muted">Secure access</p>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-omniv-danger">{error}</p>}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 gap-1.5"
            disabled={busy !== null}
            onClick={() =>
              void pay(target.id === "free" ? "starter" : (target.id as PlanId))
            }
          >
            <CreditCard className="h-3.5 w-3.5" />
            Pay with Flutterwave
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Stay limited
          </Button>
        </div>

        <ul className="mt-4 space-y-1 border-t border-omniv-border pt-4">
          {target.features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-xs text-omniv-text-secondary"
            >
              <Check className="h-3 w-3 shrink-0 text-omniv-gold" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function planName(id: PlanId): string {
  return PLANS.find((p) => p.id === id)?.name ?? id;
}
