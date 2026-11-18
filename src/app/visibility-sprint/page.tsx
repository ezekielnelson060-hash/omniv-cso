import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { VisibilitySprintCheckoutForm } from "@/components/visibility-sprint/checkout-form";

export const metadata: Metadata = {
  title: "Product Visibility Sprint — from $150 | Omniv",
  description:
    "Build a publishing presence around your product. Mini-Sprint $150 (35 publications) or Full Sprint $300 (70 publications) over 7 days. You provide existing work; we organise, format and publish on Omniv.",
  openGraph: {
    title: "Omniv Product Visibility Sprint",
    description:
      "35 or 70 individual publications in 7 days. Organised presence, professional formatting, discoverable links. From $150 one-time.",
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
  tagline: "35 publications. Organised presence. Clear start.",
  items: [
    "Up to 35 individual publications from your existing work",
    "Product / entity profile setup on Omniv",
    "Professional formatting and premium presentation",
    "Individual Omniv publication links (keyword-discoverable)",
    "Organised under your Omniv presence",
    "Delivery report with personalised links",
  ],
};

const FULL = {
  id: "full" as const,
  name: "Full Sprint",
  price: 300,
  duration: "7 days",
  tagline: "70 publications. Full presence. Maximum coverage.",
  items: [
    "Up to 70 individual publications from your existing work",
    "Full product / entity profile optimisation on Omniv",
    "Professional formatting and premium presentation",
    "Individual Omniv publication links (keyword-discoverable)",
    "Organised under your Omniv presence",
    "Delivery report with personalised links and performance notes",
  ],
};

const PUBLICATION_TYPES = [
  "Product overview",
  "Feature explanations",
  "Product updates",
  "Tutorials and guides",
  "Case studies",
  "Research and insights",
  "Industry commentary",
  "Educational articles",
  "Announcements",
  "Videos and resources",
  "Documentation extracts",
  "Other verified product material",
] as const;

const WHAT_WE_HANDLE = [
  {
    title: "Individual publications",
    body: "Each asset from your existing body of work becomes its own publication on Omniv — structured, formatted and live.",
  },
  {
    title: "Professional formatting",
    body: "Presentation that feels premium and drives clarity — not a dump of unformatted files.",
  },
  {
    title: "Discoverable links",
    body: "Every publication gets its own Omniv URL so people can find and share specific work by keyword.",
  },
  {
    title: "One organised presence",
    body: "Articles, products, announcements, videos and resources sit together under your Omniv profile.",
  },
  {
    title: "Delivery report",
    body: "Personalised links to completed publications when the sprint finishes.",
  },
] as const;

const STEPS = [
  "Choose Mini-Sprint ($150) or Full Sprint ($300) and complete payment.",
  "Share the existing work you want published — overviews, features, tutorials, research, announcements, and related assets.",
  "We organise, format and publish under your Omniv presence over 7 days.",
  "You receive publication links and a delivery report.",
] as const;

const AUDIENCE = [
  "Product owners with an existing body of work to organise",
  "SaaS and software teams with features, docs and updates to publish",
  "Researchers and creators whose work should be discoverable",
  "Brands that want more than a landing page and occasional posts",
] as const;

const FAQS = [
  {
    q: "What counts as a publication?",
    a: "One individual work or content asset — for example a product overview, a feature explanation, a tutorial, a case study, an announcement, or a research note. Each becomes its own formatted publication on Omniv, not a social post or ad.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Both packages are one-time payments with a defined publishing scope. There is no recurring charge.",
  },
  {
    q: "What is the difference between Mini and Full?",
    a: "Mini-Sprint ($150) covers up to 35 publications over 7 days. Full Sprint ($300) covers up to 70 publications over the same 7 days — roughly double the publishing scope — plus fuller profile optimisation and reporting.",
  },
  {
    q: "Do you write everything from scratch?",
    a: "You provide the existing material. We organise, format and publish it. We do not invent filler to hit a number.",
  },
  {
    q: "How long does delivery take?",
    a: "Both packages run over 7 days of publishing after kickoff, depending on how quickly materials and approvals arrive.",
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
      {label || "Choose your publishing sprint"}
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
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pb-8 pt-8 md:px-6 md:pb-10 md:pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">
            Omniv Product Visibility Sprint
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl md:leading-[1.12]">
            Build a publishing presence around your product.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Your product has more to communicate than a landing page and
            occasional social updates. Its features, research, tutorials,
            announcements, resources and insights can become individual
            publications within a connected public presence.
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Omniv helps you organise, format and publish your existing body of
            work — giving each publication its own place to be discovered.
          </p>
          <p className="mt-3 max-w-xl text-[14px] font-medium text-zinc-300">
            Mini-Sprint $150 · 35 publications · 7 days. Full Sprint $300 · 70
            publications · 7 days.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CtaLink />
            <span className="text-[12px] text-zinc-500">
              One-time engagement · Defined publishing scope · No recurring
              commitment
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
              Defined scope. One-time payment.
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-400">
              Both sprints run over 7 days. You supply existing work. We turn it
              into individual, discoverable publications under your Omniv
              presence.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PackageCard pkg={MINI} />
              <PackageCard pkg={FULL} featured />
            </div>
          </div>
        </section>

        {/* What a publication is */}
        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            What counts as a publication
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-400">
            Not social posts. Not ads. Each publication is one structured piece
            of your existing work — presented so people can discover and explore
            it on its own.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PUBLICATION_TYPES.map((t) => (
              <li
                key={t}
                className="rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-zinc-300 ring-1 ring-white/[0.06]"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* What we handle */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              What we handle
            </h2>
            <ul className="mt-4 space-y-3">
              {WHAT_WE_HANDLE.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.06]"
                >
                  <p className="text-[14px] font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-400">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
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
        </section>

        {/* Who */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Who this is for
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
            <p className="mt-4 text-[13px] text-zinc-500">
              Don't just give your product a website. Build a publishing
              presence around everything it has to offer.
            </p>
          </div>
        </section>

        {/* Checkout */}
        <section className="border-t border-white/[0.06] bg-gradient-to-b from-omniv-gold/[0.06] to-transparent">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-9">
            <div className="mb-6 max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
                Secure your sprint
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                Choose your publishing sprint
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                One-time payment. Defined deliverables. No recurring commitment.
                Flutterwave charges $150 or $300 exactly. Order confirmed only
                after payment verification.
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
              Ready to build a presence around your work?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-zinc-400">
              Mini-Sprint $150 (35 publications) or Full Sprint $300 (70
              publications). Both over 7 days. You provide the work — we publish
              it.
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
