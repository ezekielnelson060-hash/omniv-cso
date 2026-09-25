import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

export const metadata = {
  title: "Pricing",
  description: "Free publishing. Pro for verified badge and advanced tools.",
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    cta: "Get started",
    href: "/signup",
    features: [
      "Public profile",
      "Basic publishing",
      "Basic analytics",
      "Follow & contact",
      "Search & discovery",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/ month",
    cta: "Upgrade",
    href: "/signup?plan=pro",
    popular: true,
    features: [
      "Everything in Free",
      "Verified publisher badge",
      "Advanced analytics",
      "Audience insights",
      "Custom profile",
      "Lead capture",
      "Scheduling & collections",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$99",
    period: "/ month",
    cta: "Upgrade",
    href: "/signup?plan=business",
    features: [
      "Everything in Pro",
      "Multi-team members",
      "Multiple entities",
      "CRM & lead management",
      "Private publications",
      "API access",
      "Advanced analytics",
    ],
  },
] as const;

export default function PricingPage() {
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
            <Link href="/home" className="text-[13px] text-zinc-500 hover:text-white">
              Home
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-8 md:max-w-3xl md:px-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Choose the plan that fits your goals
          </h1>
          <p className="mt-2 text-[14px] text-zinc-500">
            Publish free. Upgrade for verification, analytics, and growth tools.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl p-5 ring-1 ${
                  "popular" in p && p.popular
                    ? "bg-omniv-gold/10 ring-omniv-gold/40"
                    : "bg-white/[0.03] ring-white/[0.08]"
                }`}
              >
                {"popular" in p && p.popular && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-omniv-gold px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
                    Most popular
                  </span>
                )}
                <p className="text-[15px] font-semibold text-white">{p.name}</p>
                <p className="mt-2">
                  <span className="text-2xl font-semibold text-white">
                    {p.price}
                  </span>
                  <span className="text-[13px] text-zinc-500">{p.period}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
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
                  href={p.href}
                  className={`mt-6 flex h-11 items-center justify-center rounded-full text-[14px] font-semibold ${
                    "popular" in p && p.popular
                      ? "bg-omniv-gold text-black"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-[12px] text-zinc-600">
            Verification is a Pro feature. Billing checkout ships next — plans
            above describe the product direction.
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
