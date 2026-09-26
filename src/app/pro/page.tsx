import Link from "next/link";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";
import { PricingCheckoutButton } from "@/components/discovery/pricing-checkout";
import { DISCOVERY_PLANS } from "@/lib/discovery/monetization";

export const metadata = {
  title: "Pro | Omniv",
  description: "Advanced analytics and entity-specific verified publisher status on Omniv.",
};

export default function ProPage() {
  const plan = DISCOVERY_PLANS.pro;
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-10 md:px-6 md:pt-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">Omniv Pro</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">Build something people can trust and find.</h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-zinc-400">Pro gives the identity you are publishing as better signal: deeper analytics, audience understanding, and a verified publisher status attached to the selected entity.</p>
          </div>

          <div className="mt-8 max-w-md"><CurrentIdentityBanner action="Pro will apply to" /></div>

          <section className="mt-8 grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
            <div className="rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">What Pro unlocks</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-[13px] leading-relaxed text-zinc-300"><span className="text-omniv-gold">✓</span><span>{feature}</span></li>)}
              </ul>
              <p className="mt-7 border-t border-white/[0.07] pt-5 text-[12px] leading-relaxed text-zinc-600">Verification builds trust and unlocks selected product features. It does not guarantee reach, ranking, or audience growth.</p>
            </div>

            <aside className="rounded-3xl bg-omniv-gold/10 p-6 ring-1 ring-omniv-gold/35">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">Pro</p>
              <p className="mt-3"><span className="text-4xl font-semibold text-white">${plan.priceMonthlyUsd}</span><span className="ml-1 text-[13px] text-zinc-500">{plan.billingLabel}</span></p>
              <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{plan.blurb}</p>
              <div className="mt-6"><PricingCheckoutButton plan="pro" label="Start Pro" popular /></div>
              <Link href="/verify" className="mt-4 block text-center text-[12px] text-zinc-500 hover:text-white">Already paid? Review verification →</Link>
            </aside>
          </section>

          <p className="mt-8 text-center text-[12px] text-zinc-600">Secure payment via Flutterwave. Your entity is only marked verified after the payment webhook confirms the selected entity.</p>
        </main>
      </div>
    </DiscoveryShell>
  );
}
