import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { VisibilitySprintCheckoutForm } from "@/components/visibility-sprint/checkout-form";

export const metadata: Metadata = {
  title: "Product Visibility Sprint — from $150 | Omniv",
  description:
    "Done-for-you publishing on Omniv. Mini-Sprint $150 (35 pieces over 7 days) or Full Sprint $300 (70 pieces over 7 days). You provide existing content; we publish.",
  openGraph: {
    title: "Omniv Product Visibility Sprint",
    description:
      "35 or 70 pieces of discoverable content in 7 days. Professional formatting, Omniv links, organised presence. From $150.",
    url: "https://omniv.media/visibility-sprint",
    siteName: "Omniv",
    type: "website",
  },
};

const MINI = {
  id: "mini" as const,
  name: "Mini-Sprint",
  price: 150,
  duration: "7 days",
  tagline: "35 pieces. Organised presence. Fast start.",
  items: [
    "Publication of up to 35 existing content pieces over 7 days",
    "Professional formatting and premium presentation",
    "Individual Omniv publication links (keyword-discoverable)",
    "Organised publishing under your Omniv presence",
    "Quick delivery report with links",
  ],
};

const FULL = {
  id: "full" as const,
  name: "Full Sprint",
  price: 300,
  duration: "7 days",
  tagline: "70 pieces. Full presence. Maximum coverage.",
  items: [
    "Publication of up to 70 existing content pieces over 7 days",
    "Professional formatting and premium presentation",
    "Individual Omniv publication links (keyword-discoverable)",
    "Organised publishing under your Omniv presence",
    "Delivery report with personalised links and analytics",
  ],
};

const WHAT_WE_HANDLE = [
  "Publication of your existing content pieces over 7 days — indexed and live on Omniv",
  "Professional formatting and presentation so the work has a premium feel",
  "Individual Omniv publication links so content is easier to discover by keyword",
  "Organised publishing under your Omniv presence — articles, products, announcements, videos, and more in one place",
  "A delivery report of completed work with personalised links",
] as const;

const STEPS = [
  "Choose Mini-Sprint ($150) or Full Sprint ($300) and secure payment.",
  "Share the existing content you want published — you provide the material.",
  "We format, organise and publish under your Omniv presence over 7 days.",
  "You receive publication links and a delivery report.",
] as const;

const AUDIENCE = [
  "Founders and product teams with existing content to distribute",
  "Researchers and creators with work worth discovering",
  "Brands launching or expanding product presence",
  "Anyone with valuable content who does not want to publish and hope",
] as const;

const FAQS = [
  {
    q: "Is this a subscription?",
    a: "No. Both packages are one-time payments. There is no recurring charge.",
  },
  {
    q: "What is the difference between Mini and Full?",
    a: "Mini-Sprint ($150) publishes up to 35 content pieces over 7 days. Full Sprint ($300) publishes up to 70 pieces over the same 7 days — roughly double the coverage — plus a fuller delivery report.",
  },
  {
    q: "Do you create the content from scratch?",
    a: "You provide the existing content. We handle formatting, organisation and publishing on Omniv. We do not invent filler to hit a number.",
  },
  {
    q: "How long does delivery take?",
    a: "Both packages run over 7 days of publishing after kickoff, subject to how quickly materials arrive.",
  },
  {
    q: "Do you guarantee traffic or customers?",
    a: "No. We deliver a professional publishing presence and shareable links. Discovery outcomes vary by product, audience and how you distribute the work.",
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
        href="#get-sprint"
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
        <section className="mx-auto max-w-3xl px-4 pb-8 pt-8 md:px-6 md:pb-10 md:pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">
            Omniv Product Visibility Sprint
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl md:leading-[1.12]">
            Don't just publish and hope. Build a presence around your work.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Omniv is a publishing and discovery network for products, research,
            launches, music, files, video and content worth discovering. You
            provide existing content — we format, organise and publish it under
            your presence.
          </p>
          <p className="mt-3 max-w-xl text-[14px] font-medium text-zinc-300">
            Mini-Sprint $150 · 35 pieces · 7 days. Full Sprint $300 · 70 pieces ·
            7 days.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CtaLink label="Choose your package" />
            <span className="text-[12px] text-zinc-500">
              One-time · From $150 · Limited slots
            </span>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
              Packages
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
              Paid publishing slots. You supply the content.
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-400">
              Both run over 7 days. Choose coverage: 35 pieces or 70 pieces of
              discoverable content live on Omniv.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PackageCard pkg={MINI} />
              <PackageCard pkg={FULL} featured />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            What we handle
          </h2>
          <ul className="mt-4 space-y-2.5">
            {WHAT_WE_HANDLE.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-300"
              >
                <span className="mt-0.5 text-omniv-gold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-zinc-500">
            Suitable if you have valuable content to distribute. If you've
            created something valuable, make it easier for people to discover and
            explore it.
          </p>
        </section>

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
                $150 for 35 pieces or $300 for 70 pieces — both over 7 days.
                Flutterwave charges the exact package amount. Order confirmed only
                after payment verification.
              </p>
            </div>
            <VisibilitySprintCheckoutForm />
          </div>
        </section>

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

        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-3xl px-4 py-10 text-center md:px-6">
            <h2 className="text-xl font-semibold text-white md:text-2xl">
              Ready to build a presence around your work?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-zinc-400">
              Mini-Sprint $150 (35 pieces) or Full Sprint $300 (70 pieces). Both
              over 7 days. You provide the content — we publish it.
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
