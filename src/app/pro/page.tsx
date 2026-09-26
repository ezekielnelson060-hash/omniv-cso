import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";
import { PricingCheckoutButton } from "@/components/discovery/pricing-checkout";
import {
  DISCOVERY_PLANS,
  LEGACY_CHECKOUT_AMOUNTS,
} from "@/lib/discovery/monetization";

export const metadata = {
  title: "Pro | Omniv",
  description:
    "Advanced analytics and entity-specific verified publisher status on Omniv.",
};

export default function ProPage() {
  const plan = DISCOVERY_PLANS.pro;
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-10 md:px-6 md:pt-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">
              Omniv Pro
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Build something people can trust and find.
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-zinc-400">
              Pro gives the identity you are publishing as better signal: deeper
              analytics, audience understanding, and a verified publisher status
              attached to the selected entity.
            </p>
          </div>

          <div className="mt-8 max-w-md">
            <CurrentIdentityBanner action="Pro will apply to" />
          </div>

          {/* Plan cards — match pricing layout */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="relative rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/40">
              <span className="absolute -top-2.5 right-4 rounded-full bg-omniv-gold px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
                Most popular
              </span>
              <p className="text-[15px] font-semibold text-white">Pro</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">
                  ${plan.priceMonthlyUsd}
                </span>
                <span className="text-[13px] text-zinc-500">
                  {" "}
                  {plan.billingLabel}
                </span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.slice(0, 6).map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] text-zinc-400"
                  >
                    <span className="text-omniv-gold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PricingCheckoutButton
                  plan="pro"
                  label="Upgrade to Pro"
                  popular
                />
              </div>
            </div>

            <div className="relative rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">Business</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">
                  ${LEGACY_CHECKOUT_AMOUNTS.business}
                </span>
                <span className="text-[13px] text-zinc-500"> / month</span>
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Everything in Pro",
                  "Verified on all entities",
                  "Team-ready",
                  "Private publications",
                  "Priority onboarding",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] text-zinc-400"
                  >
                    <span className="text-omniv-gold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PricingCheckoutButton
                  plan="business"
                  label="Upgrade to Business"
                />
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[12px] text-zinc-600">
            Secure payment via Flutterwave. Your entity is only marked verified
            after the payment webhook confirms the selected identity.{" "}
            <Link href="/pricing" className="text-omniv-gold hover:underline">
              Full pricing →
            </Link>
          </p>
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
