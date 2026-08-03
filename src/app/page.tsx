import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-omniv-bg text-omniv-text">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-omniv-gold/[0.05] blur-[120px]" />
      </div>

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

      {/* Hero — clear headline from the stronger original */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-8 pt-14 text-center md:px-8 md:pt-20">
        <p className="mb-5 font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
          Stop guessing. Start executing.
        </p>
        <h1 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
          Know exactly what to do next{" "}
          <span className="text-omniv-gold">for your music career</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary md:text-base">
          Omniv is an AI strategist for independent artists, managers, and
          labels. It learns your genre, goals, and platforms — then gives you
          one clear priority each week.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="h-12 min-w-[180px] gap-2 text-sm">
              Get my next move
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how">
            <Button
              variant="outline"
              size="lg"
              className="h-12 min-w-[180px] text-sm"
            >
              How it works
            </Button>
          </a>
        </div>

        {/* Simple, labeled product snapshot — not a fake full dashboard */}
        <div className="mx-auto mt-14 max-w-lg text-left">
          <p className="mb-3 text-center text-[11px] text-omniv-text-muted">
            Example of what you see after onboarding
          </p>
          <div className="rounded-2xl border border-omniv-border bg-omniv-card p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]">
            <p className="text-[11px] uppercase tracking-wider text-omniv-text-muted">
              This week's priority
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight">
              Focus content on one track before the release window
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-omniv-text-secondary">
              Based on your goals and stage. Open Ziki for a day-by-day plan.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-omniv-border pt-4">
              <span className="text-[12px] text-omniv-text-muted">
                Career scores update with your activity
              </span>
              <span className="font-data text-sm text-omniv-gold">72 overall</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/40">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center md:px-8 md:py-16">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            The cost of guessing
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Wrong week. Wrong story. Wrong spend.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-omniv-text-secondary">
            Independent teams rarely fail from a lack of talent. They lose
            months to half-finished campaigns and advice that could apply to
            anyone. Omniv exists so your next cycle is deliberate.
          </p>
        </div>
      </section>

      <section
        id="product"
        className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20"
      >
        <div className="max-w-2xl">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            Product
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Built around one question
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-omniv-text-secondary">
            What is the highest-impact move for this artist right now? Every
            screen is designed to answer that — not to dump another dashboard
            of metrics.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Command Center",
              d: "See momentum, audience, content, and release readiness in one place — and the week's priority on top.",
            },
            {
              t: "Opportunity Feed",
              d: "Ranked moves with why, when, and expected outcome. Act on this opens a plan in Ziki.",
            },
            {
              t: "Release Simulator",
              d: "Stress-test timing before you spend. Clear Go, Caution, or Hold — not a gut call.",
            },
          ].map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-omniv-border bg-omniv-card p-6"
            >
              <h3 className="text-base font-semibold tracking-tight">{card.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-omniv-text-secondary">
                {card.d.replace(/'/g, "'")}
              </p>
            </div>
          ))}
        </div>
      </section>

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
                d: "Genre, stage, goals, and platforms. That becomes Artist Brain — context for every score and chat.",
              },
              {
                n: "02",
                t: "Read this week's priority",
                d: "One high-impact move on Command Center and the opportunity feed — not a wall of tips.",
              },
              {
                n: "03",
                t: "Execute with Ziki",
                d: "Get a plan, save tasks, run the release simulator. Next week, memory stays with the project.",
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

      <section
        id="for"
        className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20"
      >
        <div className="max-w-xl">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            Who it's for
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Artists, managers, and labels
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Artists",
              d: "Leave each session with one non-negotiable for the week — tied to your goals.",
            },
            {
              t: "Managers",
              d: "Switch roster artists, track contracts and tasks, keep the next move visible.",
            },
            {
              t: "Labels",
              d: "See who is release-ready and where attention should go across the roster.",
            },
          ].map((r) => (
            <div
              key={r.t}
              className="rounded-2xl border border-omniv-border bg-omniv-card p-6"
            >
              <h3 className="text-base font-semibold tracking-tight">{r.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-omniv-text-secondary">
                {r.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/50">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center md:py-16">
          <p className="text-xl font-semibold tracking-tight md:text-2xl">
            “Every screen answers one question: what is the highest-impact move
            right now?”
          </p>
          <p className="mt-4 font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
            Omniv product principle
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Stop guessing the week away
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-omniv-text-secondary">
          Create a free account, finish onboarding, and get your first priority
          the same day.
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg" className="h-12 gap-2 px-8 text-sm">
            Get my next move
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

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
