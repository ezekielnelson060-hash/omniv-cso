import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { VisibilitySprintCheckoutForm } from "@/components/visibility-sprint/checkout-form";

export const metadata: Metadata = {
  title: "Product Visibility Sprint — $300 | Omniv",
  description:
    "Done-for-you publishing package: product profile, up to 10 publications, content prep, social posts, and a 14-day publishing plan. One-time $300.",
  openGraph: {
    title: "Omniv Product Visibility Sprint",
    description:
      "Turn product information into professionally organised publications people can discover and share. $300 one-time.",
    url: "https://omniv.media/visibility-sprint",
    siteName: "Omniv",
    type: "website",
  },
};

const DELIVERABLES = [
  {
    n: "01",
    title: "Product Profile Setup",
    body: "Create or optimise your product and brand presence on Omniv.",
  },
  {
    n: "02",
    title: "Ten Product Publications",
    body: "Up to 10 professionally formatted publications showcasing your products, features, updates and resources.",
  },
  {
    n: "03",
    title: "Product Content Preparation",
    body: "Professionally written or refined product descriptions and supporting editorial content.",
  },
  {
    n: "04",
    title: "Individual Publication Links",
    body: "Dedicated links to your published content for sharing and distribution.",
  },
  {
    n: "05",
    title: "Five Promotional Social Posts",
    body: "Supporting promotional content designed around your product and its publications.",
  },
  {
    n: "06",
    title: "Fourteen-Day Publishing Plan",
    body: "A structured plan for publishing and distributing your content over 14 days.",
  },
  {
    n: "07",
    title: "Final Delivery Report",
    body: "A summary of completed publications, links and available performance metrics.",
  },
] as const;

const STEPS = [
  "Secure your sprint.",
  "Share your product information, existing content and brand assets.",
  "We organise, prepare and publish your content.",
  "Receive your publication links, social content and delivery report.",
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
    a: "No. The Visibility Sprint is a one-time $300 service. There is no recurring charge for this package.",
  },
  {
    q: "What do you need from me?",
    a: "Product information, existing copy or assets, brand guidelines if you have them, and access to review drafts. We work from what you already have.",
  },
  {
    q: "How long does delivery take?",
    a: "We work on a structured 14-day publishing plan after kickoff. Exact timing depends on how quickly assets and feedback arrive.",
  },
  {
    q: "Do you guarantee traffic or customers?",
    a: "No. We deliver a professional publishing presence and distribution materials. Discovery outcomes vary by product, audience and how you share the work.",
  },
  {
    q: "Who is this for?",
    a: "Product teams and founders who want organised, shareable publications on Omniv without building the whole presence themselves.",
  },
] as const;

function CtaLink({ className }: { className?: string }) {
  return (
    <a
      href="#get-sprint"
      className={
        className ||
        "inline-flex h-11 items-center justify-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black transition hover:brightness-110"
      }
    >
      Get Your Visibility Sprint
    </a>
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
          <CtaLink className="inline-flex h-9 items-center justify-center rounded-full bg-omniv-gold px-4 text-[12px] font-semibold text-black" />
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
            Your product deserves more than a listing on your website and
            occasional posts on social media.
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Omniv helps businesses turn their existing product information,
            visuals, announcements and resources into professionally organised
            publications that can be discovered, explored and shared.
          </p>
          <p className="mt-3 max-w-xl text-[14px] font-medium text-zinc-300">
            You focus on building your product. We'll handle its publishing
            presence.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CtaLink />
            <span className="text-[12px] text-zinc-500">
              One-time payment · $300 · Limited capacity
            </span>
          </div>
        </section>

        {/* Package overview */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
              The $300 Visibility Sprint
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
              A done-for-you publishing and content package.
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-400">
              For a one-time payment of $300, you receive a structured publishing
              presence for your product on Omniv — prepared and published for
              you.
            </p>
          </div>
        </section>

        {/* Deliverables */}
        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            What you receive
          </h2>
          <ol className="mt-4 space-y-3">
            {DELIVERABLES.map((d) => (
              <li
                key={d.n}
                className="flex gap-3 rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.06]"
              >
                <span className="shrink-0 font-data text-[12px] font-semibold text-omniv-gold">
                  {d.n}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-white">{d.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-400">
                    {d.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
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

        {/* Pricing + form */}
        <section className="border-t border-white/[0.06] bg-gradient-to-b from-omniv-gold/[0.06] to-transparent">
          <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8 md:grid-cols-[1fr_1.15fr] md:gap-8 md:px-6 md:py-9">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
                Pricing
              </p>
              <p className="mt-2">
                <span className="text-3xl font-semibold text-white">$300</span>
                <span className="ml-2 text-[14px] text-zinc-500">one-time</span>
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                Your product has a story. Give people more ways to discover it.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                Stop leaving valuable product information scattered across
                different channels. Give it a professionally organised publishing
                presence on Omniv.
              </p>
              <p className="mt-4 text-[12px] font-medium text-zinc-500">
                Limited client capacity.
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
              Secure your Visibility Sprint and we'll turn your product
              materials into a clear publishing presence on Omniv.
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
