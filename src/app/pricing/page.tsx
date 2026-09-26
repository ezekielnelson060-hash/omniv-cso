import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { PricingCheckoutButton } from "@/components/discovery/pricing-checkout";
import { DISCOVERY_PLANS, LEGACY_CHECKOUT_AMOUNTS } from "@/lib/discovery/monetization";

export const metadata = {
  title: "Pricing",
  description: "Free publishing. Pro for verified badge. Pay with card from day 1.",
};

type Props = {
  searchParams: Promise<{ billing?: string; plan?: string }>;
};

export default async function PricingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const proPlan = DISCOVERY_PLANS.pro;
  const success = sp.billing === "success";
  const paidPlan = sp.plan;

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-3xl md:px-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-[15px] font-semibold text-white">
                Pricing
              </span>
            </div>
            <Link
              href="/home"
              className="text-[13px] text-zinc-500 hover:text-white"
            >
              Home
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-8 md:max-w-3xl md:px-6">
          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-500/15 px-4 py-3 text-center ring-1 ring-emerald-500/30">
              <p className="text-[14px] font-semibold text-emerald-300">
                Checkout returned
                {paidPlan ? ` · ${paidPlan}` : ""}
              </p>
              <p className="mt-1 text-[12px] text-zinc-400">
                Your selected entity will show the verified badge only after
                the payment webhook confirms the transaction.
              </p>
              <Link
                href="/accounts"
                className="mt-2 inline-block text-[13px] text-omniv-gold"
              >
                View your entities →
              </Link>
            </div>
          )}

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Choose the plan that fits your goals
          </h1>
          <p className="mt-2 text-[14px] text-zinc-500">
            Publish free. Upgrade for verification and growth tools. Card
            payments via Flutterwave — live from day 1.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {/* Free */}
            <div className="relative rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">Free</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">$0</span>
                <span className="text-[13px] text-zinc-500"> forever</span>
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Public profile",
                  "Basic publishing",
                  "Follow & contact",
                  "Search & discovery",
                  "Multiple entities",
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
              <Link
                href="/signup"
                className="mt-6 flex h-11 items-center justify-center rounded-full bg-white/10 text-[14px] font-semibold text-white"
              >
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/40">
              <span className="absolute -top-2.5 right-4 rounded-full bg-omniv-gold px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
                Most popular
              </span>
              <p className="text-[15px] font-semibold text-white">Pro</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">${proPlan.priceMonthlyUsd}</span>
                <span className="text-[13px] text-zinc-500"> {proPlan.billingLabel}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {proPlan.features.map((f) => (
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
                <PricingCheckoutButton plan="pro" label="Upgrade to Pro" popular />
              </div>
            </div>

            {/* Business */}
            <div className="relative rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">Business</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">${LEGACY_CHECKOUT_AMOUNTS.business}</span>
                <span className="text-[13px] text-zinc-500"> / month</span>
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Everything in Pro",
                  "Entity-specific verification",
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
                <PricingCheckoutButton plan="business" label="Upgrade to Business" />
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-[12px] text-zinc-600">
            Secure card payments via Flutterwave. You must be signed in so we
            can attach Pro to your account and turn on verified badges. Pro
            renews monthly when a successful payment is received.
          </p>
          <p className="mt-2 text-center text-[12px] text-zinc-600">
            <Link href="/signup?next=/pricing" className="text-omniv-gold">
              Sign in to pay →
            </Link>
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
