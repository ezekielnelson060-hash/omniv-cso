"use client";

import { useState } from "react";
import Link from "next/link";
import { startFlutterwaveCheckout, type CheckoutPlan } from "@/lib/checkout";

export function PricingCheckoutButton({
  plan,
  label,
  popular,
}: {
  plan: CheckoutPlan;
  label: string;
  popular?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    setError(null);
    setLoading(true);
    try {
      const result = await startFlutterwaveCheckout({ plan });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.link;
    } catch {
      setError("Could not start payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onPay}
        disabled={loading}
        className={`flex h-11 w-full items-center justify-center rounded-full text-[14px] font-semibold disabled:opacity-60 ${
          popular
            ? "bg-omniv-gold text-black"
            : "bg-white/10 text-white"
        }`}
      >
        {loading ? "Opening checkout…" : label}
      </button>
      {error && (
        <p className="mt-2 text-center text-[12px] text-rose-400">
          {error}
          {error.includes("Sign in") && (
            <>
              {" "}
              <Link href="/signup?next=/pricing" className="underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
