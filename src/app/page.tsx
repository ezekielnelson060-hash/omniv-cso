import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-omniv-bg text-omniv-text">
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-omniv-gold/[0.05] blur-[120px]" />
      </div>

      {/* Nav */}
      <header className="relative z-20 border-b border-omniv-border/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={30}
              height={30}
              className="rounded-md"
              priority
            />
            <span className="text-[15px] font-semibold tracking-tight">Omniv</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[13px] text-omniv-text-secondary md:flex">
            <a href="#product" className="transition-colors hover:text-omniv-text">
              Product
            </a>
            <a href="#how" className="transition-colors hover:text-omniv-text">
              How it works
            </a>
            <a href="#for" className="transition-colors hover:text-omniv-text">
              Who it's for
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-9 text-[13px]">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-9 text-[13px]">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
            Career intelligence for music
          </p>
          <h1 className="text-balance text-[2.4rem] font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-[3.5rem]">
            Your next move,
            <br />
            <span className="text-omniv-gold">before you guess wrong</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-omniv-text-secondary md:text-[17px]">
            Omniv is the AI Chief Strategy Officer for independent artists,
            managers, and labels. It learns your sound and stage — then tells
            you the highest-impact action this week.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-12 min-w-[180px] gap-2 text-sm">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#product">
              <Button
                variant="outline"
                size="lg"
                className="h-12 min-w-[180px] text-sm"
              >
                See the product
              </Button>
            </a>
          </div>
        </div>

        {/* Product frame */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-omniv-border bg-omniv-elevated shadow-[0_0_0_1px_rgba(212,175,55,0.06),0_40px_80px_-20px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-2 border-b border-omniv-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-data text-[11px] text-omniv-text-muted">
                omniv.media / command-center
              </span>
            </div>
            <div className="grid gap-0 md:grid-cols-[200px_1fr]">
              <aside className="hidden border-r border-omniv-border bg-omniv-bg/80 p-4 md:block">
                <p className="font-data text-[10px] uppercase tracking-wider text-omniv-text-muted">
                  Workspace
                </p>
                <ul className="mt-3 space-y-2 text-[12px] text-omniv-text-secondary">
                  {[
                    "Command Center",
                    "Artist Brain",
                    "Opportunities",
                    "Ziki",
                    "Release Simulator",
                  ].map((item, i) => (
                    <li
                      key={item}
                      className={`rounded-lg px-2.5 py-1.5 ${
                        i === 0
                          ? "bg-omniv-gold/10 text-omniv-gold"
                          : "hover:bg-omniv-hover"
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="space-y-4 p-5 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-omniv-text-muted">This week</p>
                    <p className="mt-0.5 text-lg font-semibold tracking-tight">
                      Priority: lock the release window
                    </p>
                  </div>
                  <span className="rounded-full border border-omniv-gold/30 bg-omniv-gold/10 px-3 py-1 font-data text-[11px] text-omniv-gold">
                    Confidence 78%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { l: "Momentum", v: "72" },
                    { l: "Audience", v: "64" },
                    { l: "Content", v: "58" },
                    { l: "Release", v: "81" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-xl border border-omniv-border bg-omniv-card px-3 py-3"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                        {s.l}
                      </p>
                      <p className="mt-1 font-data text-xl font-medium text-omniv-gold">
                        {s.v}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-omniv-border bg-omniv-card p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-omniv-gold">
                    Opportunity
                  </p>
                  <p className="mt-1.5 text-sm font-medium">
                    Stress-test Friday vs the following Thursday before paid spend
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-omniv-text-secondary">
                    Competitor density is lower mid-next week. Priming pack is
                    ready — hold budget until the simulator says Go.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-omniv-gold">
                    Act on this in Ziki
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/40">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-20">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            The cost of guessing
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Wrong week. Wrong story. Wrong spend.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-omniv-text-secondary md:text-base">
            Independent teams rarely fail from a lack of talent. They lose months
            to half-finished campaigns, release windows that collide with bigger
            drops, and advice that could apply to anyone. Omniv exists so your
            next cycle is deliberate — not hopeful.
          </p>
        </div>
      </section>

      {/* Product narrative */}
      <section id="product" className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            Product
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            A strategist that already knows your project
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-omniv-text-secondary">
            Onboarding captures genre, goals, platforms, and stage. From there,
            Command Center, opportunities, and Ziki stay aligned — so every
            recommendation is about <em className="text-omniv-text not-italic">your</em> career,
            not a generic playlist tip.
          </p>
        </div>

        <div className="mt-12 space-y-16 md:space-y-24">
          {[
            {
              eyebrow: "Command Center",
              title: "See the state of the career in one glance",
              body: "Momentum, audience health, content, and release readiness update as your profile and activity change. Soft spots are visible before you commit budget or favours.",
              accent: "Scores · priorities · weekly focus",
            },
            {
              eyebrow: "Opportunity Feed",
              title: "One ranked move — not a wall of ideas",
              body: "Each opportunity carries why it matters, expected outcome, and confidence. Act on this opens Ziki with a plan already forming, so strategy becomes a checklist you can finish.",
              accent: "Impact · timing · execution",
            },
            {
              eyebrow: "Release Simulator",
              title: "Stress-test the window before you burn it",
              body: "Compare dates, competitor proximity, and priming readiness. Get a clear Go, Caution, or Hold — with a path for playlists, short-form, and what not to spend money on yet.",
              accent: "Timing · competition · priming",
            },
          ].map((block, i) => (
            <div
              key={block.eyebrow}
              className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
                  {block.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
                  {block.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-omniv-text-secondary">
                  {block.body}
                </p>
                <p className="mt-4 font-data text-[11px] text-omniv-text-muted">
                  {block.accent}
                </p>
              </div>
              <div className="rounded-2xl border border-omniv-border bg-gradient-to-br from-omniv-card to-omniv-elevated p-8 md:p-10">
                <div className="flex h-40 items-center justify-center md:h-48">
                  <div className="text-center">
                    <p className="font-data text-4xl font-medium text-omniv-gold md:text-5xl">
                      {i === 0 ? "81" : i === 1 ? "P0" : "Go"}
                    </p>
                    <p className="mt-2 text-xs text-omniv-text-muted">
                      {i === 0
                        ? "Release readiness"
                        : i === 1
                          ? "This week's priority"
                          : "Simulator verdict"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="relative z-10 border-y border-omniv-border bg-omniv-elevated/30"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-xl">
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              From profile to plan in three steps
            </h2>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                n: "01",
                t: "Tell Omniv who you are",
                d: "Genre, stage, goals, and the platforms you actually use. This becomes Artist Brain — the context every score and chat relies on.",
              },
              {
                n: "02",
                t: "Read the week's priority",
                d: "Command Center and the opportunity feed surface one high-impact move. No scrolling a dozen equal tips.",
              },
              {
                n: "03",
                t: "Execute with Ziki",
                d: "Open the plan, save tasks, stress-test a release, or capture fans. Come back next week — memory stays with the project.",
              },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-data text-sm text-omniv-gold">{s.n}</p>
                <h3 className="mt-3 text-base font-semibold tracking-tight">
                  {s.t.replace(/'/g, "'")}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-omniv-text-secondary">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who */}
      <section id="for" className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="max-w-xl">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            Built for the independent system
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Artists, managers, and labels — same intelligence, different seats
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Artists",
              d: "Leave each session with a non-negotiable for the week — content, release, or fans — tied to your goals.",
            },
            {
              t: "Managers",
              d: "Switch roster artists, log contracts, and keep tasks and fan gates aligned without losing the next move.",
            },
            {
              t: "Labels",
              d: "See who is release-ready, who needs priming, and where attention should go across the roster.",
            },
          ].map((r) => (
            <div
              key={r.t}
              className="rounded-2xl border border-omniv-border bg-omniv-card p-6 md:p-7"
            >
              <h3 className="text-base font-semibold tracking-tight">{r.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-omniv-text-secondary">
                {r.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote strip */}
      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/50">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <p className="text-xl font-semibold tracking-tight text-omniv-text md:text-2xl">
            “Every screen answers one question: what is the highest-impact move
            right now?”
          </p>
          <p className="mt-4 font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
            Omniv product principle
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Stop guessing the week away
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-omniv-text-secondary">
          Create a free account, complete onboarding, and get your first priority
          the same day.
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg" className="h-12 gap-2 px-8 text-sm">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-omniv-border bg-omniv-elevated">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="text-sm font-semibold">Omniv</span>
              </div>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-omniv-text-secondary">
                AI career intelligence for independent music teams.
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-omniv-text">Product</p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>
                  <a href="#product" className="hover:text-omniv-text">
                    Platform
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-omniv-text">
                    How it works
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-omniv-text">
                    Start free
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-medium text-omniv-text">Company</p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>
                  <Link href="/privacy" className="hover:text-omniv-text">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-omniv-text">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-omniv-text">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-medium text-omniv-text">Account</p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>
                  <Link href="/login" className="hover:text-omniv-text">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-omniv-text">
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-omniv-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-omniv-text-muted">
              © {new Date().getFullYear()} Omniv Systems. All rights reserved.
            </p>
            <p className="text-[12px] text-omniv-text-muted">omniv.media</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
