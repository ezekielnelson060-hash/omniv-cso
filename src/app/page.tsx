import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Target,
  BarChart3,
  Sparkles,
  Radio,
  Users,
  Shield,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-omniv-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-omniv-gold/[0.04] blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-omniv-border/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={28}
              height={28}
              className="rounded-md"
              priority
            />
            <span className="text-[15px] font-semibold tracking-tight">Omniv</span>
            <span className="hidden font-data text-[10px] uppercase tracking-[0.14em] text-omniv-text-muted sm:inline">
              Intelligence
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-omniv-text-secondary md:flex">
            <a href="#outcomes" className="hover:text-omniv-text">
              Outcomes
            </a>
            <a href="#platform" className="hover:text-omniv-text">
              Platform
            </a>
            <a href="#who" className="hover:text-omniv-text">
              Who it&apos;s for
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-8 text-[13px]">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-10 pt-12 text-center md:px-8 md:pt-16">
        <p className="mb-4 font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
          Stop guessing. Start executing.
        </p>
        <h1 className="text-balance text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-omniv-text md:text-5xl lg:text-[3.25rem]">
          Know exactly what to do next
          <span className="text-omniv-gold"> for your music career</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary">
          Omniv gives independent artists, managers, and labels a clear weekly
          plan — ranked opportunities, live scores, and an AI strategist (Ziki)
          that already knows your genre, goals, and platforms.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="h-11 min-w-[160px] gap-2 text-[13px]">
              Get my next move
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <a href="#outcomes">
            <Button variant="outline" size="lg" className="h-11 min-w-[160px] text-[13px]">
              See what you get
            </Button>
          </a>
        </div>
      </section>

      {/* Outcomes — user benefits */}
      <section
        id="outcomes"
        className="relative z-10 border-y border-omniv-border bg-omniv-elevated/40"
      >
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
            What you walk away with
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Outcomes, not another dashboard
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "A ranked list of moves for your sound and stage — not generic tips",
              "Scores that change when you update goals, links, or platforms",
              "One-tap plans in Ziki so opportunities become a 7-day checklist",
              "Memory of past strategy chats so you never restart from zero",
              "Manager & label seats when you grow beyond a solo project",
              "Release and content stress-tests before you spend the cycle",
            ].map((b) => (
              <li
                key={b}
                className="flex gap-2.5 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card px-4 py-3 text-[13px] leading-relaxed text-omniv-text-secondary"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-10 border-b border-omniv-border">
        <div className="mx-auto grid max-w-6xl divide-y divide-omniv-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              k: "01",
              t: "You stop wasting cycles",
              d: "One priority per week instead of five half-finished experiments.",
            },
            {
              k: "02",
              t: "You get label-grade clarity",
              d: "Without hiring a full strategy team — Ziki briefs like a CSO.",
            },
            {
              k: "03",
              t: "Your profile is the product",
              d: "Onboarding genre, goals, and links power every score and opportunity.",
            },
          ].map((x) => (
            <div key={x.k} className="px-5 py-6 md:px-8 md:py-7">
              <p className="font-data text-[10px] text-omniv-gold">{x.k}</p>
              <h3 className="mt-1.5 text-sm font-semibold tracking-tight">{x.t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-omniv-text-secondary">
                {x.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="relative z-10 mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
        <div className="mb-7">
          <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
            Platform
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            How Omniv works for you
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Brain,
              t: "Artist Brain",
              d: "Your music identity stays saved — so advice matches your sound, not a template.",
            },
            {
              icon: BarChart3,
              t: "Command Center",
              d: "See growth, momentum, and release readiness in one glance — know where you're soft.",
            },
            {
              icon: Target,
              t: "Opportunity Feed",
              d: "Ranked actions by impact and confidence. Tap Act on this → get a plan in Ziki.",
            },
            {
              icon: Sparkles,
              t: "Ziki",
              d: "Your AI strategist. Remembers chats, uses your scores, talks in outcomes.",
            },
            {
              icon: Radio,
              t: "Release Simulator",
              d: "Test timing and positioning before you burn a release window.",
            },
            {
              icon: Users,
              t: "Manager & Label",
              d: "Run more than one artist without losing the next move for each.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-omniv-gold/10">
                <f.icon className="h-3.5 w-3.5 text-omniv-gold" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight">{f.t}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-omniv-text-secondary">
                  {f.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="who" className="relative z-10 border-y border-omniv-border bg-omniv-elevated/30">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3">
          {[
            {
              icon: Shield,
              t: "Artists",
              d: "Leave each session knowing this week's non-negotiable — and why it matters for your goals.",
            },
            {
              icon: Users,
              t: "Managers",
              d: "Prioritise the right artist this hour. Notes, tasks, and Ziki in one seat.",
            },
            {
              icon: BarChart3,
              t: "Labels",
              d: "Roster clarity: who is ready to release, who needs content, who needs focus.",
            },
          ].map((r, i) => (
            <div
              key={r.t}
              className={`px-5 py-8 md:px-8 ${i < 2 ? "border-b border-omniv-border md:border-b-0 md:border-r" : ""}`}
            >
              <r.icon className="h-4 w-4 text-omniv-gold" />
              <h3 className="mt-3 text-sm font-semibold">{r.t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-omniv-text-secondary">
                {r.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-12 text-center md:py-14">
        <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
          Core promise
        </p>
        <p className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
          Every screen answers one question:
        </p>
        <p className="mt-2 text-lg text-omniv-gold md:text-xl">
          What is the highest-impact move for me right now?
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg" className="h-11 gap-2 text-[13px]">
            Start free — get my plan
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </section>

      <footer className="relative z-10 border-t border-omniv-border bg-omniv-elevated">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="" width={24} height={24} className="rounded" />
                <span className="text-sm font-semibold">Omniv</span>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-omniv-text-secondary">
                Career intelligence for independent music — so you spend less
                time deciding and more time shipping.
              </p>
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-text-muted">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>
                  <a href="#platform" className="hover:text-omniv-text">
                    Platform
                  </a>
                </li>
                <li>
                  <a href="#outcomes" className="hover:text-omniv-text">
                    Outcomes
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
              <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-text-muted">
                For
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>Independent artists</li>
                <li>Managers</li>
                <li>Labels & collectives</li>
              </ul>
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-text-muted">
                Account
              </p>
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
          <div className="mt-10 flex flex-col gap-3 border-t border-omniv-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-data text-[11px] text-omniv-text-muted">
              © {new Date().getFullYear()} Omniv Systems · All rights reserved
            </p>
            <p className="text-[11px] text-omniv-text-muted">
              Strategy first · Black · Gold
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
