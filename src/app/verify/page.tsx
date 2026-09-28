"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  VERIFY_FEE_USD,
  VERIFY_FEE_LABEL,
  VERIFY_FEE_TITLE,
} from "@/lib/discovery/verify-pricing";

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/flutterwave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "verify" }),
      });
      const data = await res.json();
      if (data?.link) {
        window.location.href = data.link;
        return;
      }
      setError(data?.error || "Could not start payment.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DiscoveryShell>
      <div className="mx-auto min-h-dvh w-full max-w-lg overflow-x-hidden bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
            >
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Get verified</h1>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6">
          <p className="text-[20px] font-semibold text-white">Omniv Verification</p>
          <p className="mt-2 text-[14px] text-zinc-400">
            Monthly fee while under review and while verified. Review is not automatic.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-omniv-gold/30">
            <div className="bg-omniv-gold/10 px-5 py-5">
              <p className="text-[13px] font-medium text-omniv-gold">{VERIFY_FEE_TITLE}</p>
              <p className="mt-1 text-[32px] font-semibold tracking-tight text-white">
                ${VERIFY_FEE_USD}
                <span className="text-[16px] font-medium text-zinc-400">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-zinc-300">
                {[
                  "Identity / entity review",
                  "Verification badge if approved",
                  "Verified publisher status",
                  "Badge on publications",
                  "Priority review (1–3 business days)",
                  "Free resubmission if more evidence is needed",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-omniv-gold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">
            Payment enters the review queue. It does not guarantee a badge. Cancel anytime.
          </p>

          {error && (
            <p className="mt-3 text-[13px] text-red-400">{error}</p>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => void startCheckout()}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Starting…" : `Apply for verification — ${VERIFY_FEE_LABEL}`}
          </button>

          <p className="mt-6 text-center text-[12px] text-zinc-600">
            Already applied? Check status in Settings after payment.
          </p>
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
