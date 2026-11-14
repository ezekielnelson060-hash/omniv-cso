import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { VisibilitySprintCheckoutForm } from "@/components/visibility-sprint/checkout-form";

export const metadata: Metadata = {
  title: "Product Visibility Sprint — from $75 | Omniv",
  description:
    "Done-for-you product publishing on Omniv. Mini-Sprint $75 (5 publications) or Full Sprint $300 (15 publications, 14-day plan, final report).",
  openGraph: {
    title: "Omniv Product Visibility Sprint",
    description:
      "Turn product information into professionally organised publications. Mini-Sprint $75 or Full Sprint $300.",
    url: "https://omniv.media/visibility-sprint",
    siteName: "Omniv",
    type: "website",
  },
};

const MINI = {
  id: "mini" as const,
  name: "Mini-Sprint",
  price: 75,
  duration: "48 hours",
  tagline: "Fast entry. Clear product presence.",
  items: [
    "Product profile setup / optimisation",
    "5 product publications",
    "5 supporting descriptions",
    "Individual publication links",
    "2 promotional social posts",
  ],
};

const FULL = {
  id: "full" as const,
  name: "Full Sprint",
  price: 300,
  duration: "14 days",
  tagline: "15 publications. One organised product presence.",
  items: [
    "Full product profile optimisation",
    "15 product publications",
    "15 supporting descriptions",
    "Individual publication links",
    "5 promotional social posts",
    "14-day publishing plan",
    "Final delivery report",
  ],
};

const FULL_CONTENT_TYPES = [
  "Product overview",
  "Core features",
  "Product use cases",
  "Feature explanations",
  "Tutorials and guides",
  "Industry insights",
  "Product announcements",
  "Customer problems and solutions",
  "Educational resources",
  "Product comparisons (where substantiated)",
] as const;

const STEPS = [
  "Choose Mini-Sprint or Full Sprint and secure payment.",
  "Share product information, existing content and brand assets.",
  "We organise, prepare and publish from verified material — not filler.",
  "Receive publication links, social content and (Full) your report.",
] as const;

const AUDIENCE = [
  "SaaS companies and software founders",
  "E-commerce and consumer product brands",
  "Startups launching new products",
  "Independent product creators",
  "Businesses introducing new services or product lines",
] as const;

const FAQS = [
  {
    q: "Is this a subscription?",
    a: "No. Both packages are one-time payments. There is no recurring charge for the Visibility Sprint.",
  },
  {
    q: "What is the difference between Mini and Full?",
    a: "Mini-Sprint ($75) is the introductory package: profile setup, 5 publications, 5 descriptions and 2 social posts, typically within 48 hours. Full Sprint ($300) is the flagship: 15 publications, 15 descriptions, 5 social posts, a 14-day publishing plan and a final report.",
  },
  {
    q: "Are the 15 publications just repetitive articles?",
    a: "No. Content is based on your existing information, verified product details and approved material — overviews, features, use cases, guides and other relevant product content. We do not invent filler to hit a number.",
  },
  {
    q: "What do you need from me?",
    a: "Product information, existing copy or assets, brand guidelines if you have them, and access to review drafts. We work from what you already have.",
  },
  {
    q: "Do you guarantee traffic or customers?",
    a: "No. We deliver a professional publishing presence and distribution materials. Discovery outcomes vary by product, audience and how you share the work.",
  },
] as const;

function CtaLink({ className, label }: { className?: string; label?: string }) {
  return (
    <a
      href="#get-sprint"
      className={
        className ||
        "inline-flex h-11 items-center justify-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black transition hover:brightness-110"
      }
    >
      {label || "Get Your Visibility Sprint"}
    </a>
  );
}

function PackageCard({
  pkg,
  featured,
}: {
  pkg: typeof MINI | typeof FULL;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl p-5 ring-1 ${
        featured
          ? "bg-omniv-gold/[0.08] ring-omniv-gold/35"
          : "bg-white/[0.03] ring-white/[0.08]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            {pkg.name}
          </p>
          <p className="mt-1 text-[13px] text-zinc-400">{pkg.tagline}</p>
        </div>
        {featured ? (
          <span className="shrink-0 rounded-full bg-omniv-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-omniv-gold">
            Flagship
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Intro
          </span>
        )}
      </div>
      <p className="mt-4">
        <span className="text-3xl font-semibold text-white">${pkg.price}</span>
        <span className="ml-2 text-[13px] text-zinc-500">one-time · {pkg.duration}</span>
      </p>
      <ul className="mt-4 flex-1 space-y-2">
        {pkg.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-zinc-300">
            <span className="mt-0.5 text-omniv-gold">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <a
        href={`#get-sprint`}
        className={`mt-5 inline-flex h-11 items-center justify-center rounded-full text-[13px] font-semibold transition ${
          featured
            ? "bg-omniv-gold text-black hover:brightness-110"
            : "bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        Choose {pkg.name} — ${pkg.price}
      </a>
    </div>
  );
}

export default function VisibilitySprintPage() {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Omniv"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
              priority
            />
            <span className="text-[15px] font-semibold text-white">Omniv</span>
          </Link>
          <CtaLink
            className="inline-flex h-9 items-center justify-center rounded-full bg-omniv-gold px-4 text-[12px] font-semibold text-black"
            label="Get started"
          />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pb-8 pt-8 md:px-6 md:pb-10 md:pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">
            Omniv Product Visibility Sprint
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl md:leading-[1.12]">
            Give your product more opportunities to be discovered.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Turn existing product information into professionally organised
            publications people can discover, explore and share — without building
            the whole presence yourself.
          </p>
          <p className="mt-3 max-w-xl text-[14px] font-medium text-zinc-300">
            Start with the $75 Mini-Sprint, or take the $300 Full Sprint for a
            deeper publishing engagement.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CtaLink label="Choose your package" />
            <span className="text-[12px] text-zinc-500">
              One-time · From $75 · Limited capacity
            </span>
          </div>
        </section>

        {/* Packages */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
              Packages
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
              Introductory entry. Flagship depth.
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-400">
              The Mini-Sprint is the easiest way in. The Full Sprint is the main
              offer — 15 publications and a structured 14-day plan.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PackageCard pkg={MINI} />
              <PackageCard pkg={FULL} featured />
            </div>
          </div>
        </section>

        {/* Full Sprint depth */}
        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            What the Full Sprint covers
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-400">
            Fifteen publications. One organised product presence. More
            opportunities for discovery — built from verified product details and
            approved material.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {FULL_CONTENT_TYPES.map((t) => (
              <li
                key={t}
                className="rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-zinc-300 ring-1 ring-white/[0.06]"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              How it works
            </h2>
            <ol className="mt-4 space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 text-[11px] font-semibold text-omniv-gold">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-[14px] text-zinc-300">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who */}
        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            Who is this for?
          </h2>
          <ul className="mt-4 space-y-1.5">
            {AUDIENCE.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[14px] text-zinc-400"
              >
                <span className="mt-0.5 text-omniv-gold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Checkout */}
        <section className="border-t border-white/[0.06] bg-gradient-to-b from-omniv-gold/[0.06] to-transparent">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <div className="mb-6 max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
                Secure your sprint
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                Pick a package and continue to payment
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                Mini-Sprint for a fast start. Full Sprint when you want the
                complete publishing engagement. Payment amounts match Flutterwave
                checkout exactly.
              </p>
            </div>
            <VisibilitySprintCheckoutForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
          <h2 className="text-lg font-semibold text-white md:text-xl">FAQ</h2>
          <div className="mt-4 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="text-[14px] font-semibold text-white">{f.q}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-3xl px-4 py-10 text-center md:px-6">
            <h2 className="text-xl font-semibold text-white md:text-2xl">
              Ready to publish with intention?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-zinc-400">
              Start with $75 or go Full Sprint at $300. Either way, your product
              gets a clearer publishing presence on Omniv.
            </p>
            <div className="mt-5">
              <CtaLink />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center text-[12px] text-zinc-600">
        <Link href="/home" className="text-zinc-500 hover:text-white">
          Omniv
        </Link>
        {" · "}
        Discovery network · omniv.media
      </footer>
    </div>
  );
}
