import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { PricingCheckoutButton } from "@/components/discovery/pricing-checkout";
import { DISCOVERY_PLANS } from "@/lib/discovery/monetization";

export const metadata = {
  title: "Pricing",
  description:
    "Free publishing. Pro $29 and Business $99. Pay with card from day 1.",
};

type Props = {
  searchParams: Promise<{ billing?: string; plan?: string }>;
};

export default async function PricingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const proPlan = DISCOVERY_PLANS.pro;
  const success = sp.billing === "success";
  const paidPlan = sp.plan;
  const bizPlan = DISCOVERY_PLANS.business;

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
              href="/settings/billing"
              className="text-[13px] text-zinc-500 hover:text-white"
            >
              Billing
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 pb-28 pt-10 md:px-6">
          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300 ring-1 ring-emerald-500/30">
              Payment received
              {paidPlan ? ` for ${paidPlan}` : ""}. Plan activates after the
              webhook confirms — refresh Billing in a few seconds.
            </div>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">
            Plans
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Publish free. Upgrade when you need signal.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-zinc-400">
            Free covers the full discovery loop. Pro and Business add
            verification, deeper analytics, and team-ready tools.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">Free</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">$0</span>
                <span className="text-[13px] text-zinc-500"> forever</span>
              </p>
              <ul className="mt-4 space-y-2">
                {DISCOVERY_PLANS.free.features.map((f) => (
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
                <Link
                  href="/signup"
                  className="flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-[14px] font-semibold text-white"
                >
                  Start free
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/40">
              <span className="absolute -top-2.5 right-4 rounded-full bg-omniv-gold px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
                Popular
              </span>
              <p className="text-[15px] font-semibold text-white">Pro</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">
                  ${proPlan.priceMonthlyUsd}
                </span>
                <span className="text-[13px] text-zinc-500">
                  {" "}
                  {proPlan.billingLabel}
                </span>
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
                <PricingCheckoutButton
                  plan="pro"
                  label="Upgrade to Pro"
                  popular
                />
              </div>
            </div>

            {/* Business */}
            <div className="relative rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">Business</p>
              <p className="mt-2">
                <span className="text-2xl font-semibold text-white">
                  ${bizPlan.priceMonthlyUsd}
                </span>
                <span className="text-[13px] text-zinc-500"> / month</span>
              </p>
              <ul className="mt-4 space-y-2">
                {bizPlan.features.map((f) => (
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

          <p className="mt-10 text-center text-[12px] text-zinc-600">
            Secure card payments via Flutterwave. Sign in so we can attach the
            plan to your account. Subscriptions renew monthly after a successful
            charge.
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
