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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-omniv-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-omniv-gold/[0.04] blur-[100px]" />
      </div>

      {/* Header — tight */}
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
            <a href="#platform" className="hover:text-omniv-text">
              Platform
            </a>
            <a href="#who" className="hover:text-omniv-text">
              Who it&apos;s for
            </a>
            <a href="#system" className="hover:text-omniv-text">
              System
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
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — minimal vertical space */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-10 pt-12 text-center md:px-8 md:pt-16">
        <p className="mb-4 font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
          Career intelligence for independent music
        </p>
        <h1 className="text-balance text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-omniv-text md:text-5xl lg:text-[3.25rem]">
          The highest-impact move
          <span className="text-omniv-gold"> for your career</span>
          <span className="text-omniv-text-muted"> — every day.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary">
          Omniv is an AI Chief Strategy Officer for artists, managers, and labels.
          Not captions. Not stems. Continuous strategy: what to do, why, when, and
          the expected outcome.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="h-11 min-w-[160px] gap-2 text-[13px]">
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <a href="#platform">
            <Button variant="outline" size="lg" className="h-11 min-w-[160px] text-[13px]">
              View platform
            </Button>
          </a>
        </div>
      </section>

      {/* Problem strip — dense */}
      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/40">
        <div className="mx-auto grid max-w-6xl divide-y divide-omniv-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              k: "01",
              t: "Strategy is scattered",
              d: "Playlists, short-form, release timing, and brand live in different tabs.",
            },
            {
              k: "02",
              t: "AI stopped at content",
              d: "Most music AI writes captions. Almost none run a career operating system.",
            },
            {
              k: "03",
              t: "Independents compete blind",
              d: "Labels still have rooms of people. You need the same clarity without the headcount.",
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

      {/* Platform */}
      <section id="platform" className="relative z-10 mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
        <div className="mb-7 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
              Platform
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              One system. One next move.
            </h2>
          </div>
          <p className="max-w-md text-[13px] text-omniv-text-secondary">
            Built as intelligence infrastructure — scores, memory, and briefings
            in one operating surface.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Brain,
              t: "Artist Brain",
              d: "Permanent memory of style, audience, goals, and gaps. Grounds every recommendation.",
            },
            {
              icon: BarChart3,
              t: "Command Center",
              d: "Executive KPIs: growth, momentum, audience health, release readiness.",
            },
            {
              icon: Target,
              t: "Opportunity Feed",
              d: "Ranked moves by impact, difficulty, confidence, and expected outcome.",
            },
            {
              icon: Sparkles,
              t: "Ziki",
              d: "AI CSO. Answers as briefings — not chat. Knows your Artist Brain.",
            },
            {
              icon: Radio,
              t: "Release Simulator",
              d: "Stress-test timing and positioning before you spend the cycle.",
            },
            {
              icon: Users,
              t: "Manager & Label",
              d: "Multi-artist prioritisation and roster intelligence when you scale.",
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

      {/* Who */}
      <section id="who" className="relative z-10 border-y border-omniv-border bg-omniv-elevated/30">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3">
          {[
            {
              icon: Shield,
              t: "Artists",
              d: "Solo career OS — scores, opportunities, Ziki briefings tuned to your stage.",
            },
            {
              icon: Users,
              t: "Managers",
              d: "Prioritise the right artist this hour. CRM with strategy, not just contacts.",
            },
            {
              icon: BarChart3,
              t: "Labels",
              d: "Roster health and release readiness across the catalogue.",
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

      {/* System principle */}
      <section id="system" className="relative z-10 mx-auto max-w-3xl px-5 py-12 text-center md:py-14">
        <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
          Core principle
        </p>
        <p className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
          Every screen answers one question:
        </p>
        <p className="mt-2 text-lg text-omniv-gold md:text-xl">
          What is the highest-impact move right now?
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg" className="h-11 gap-2 text-[13px]">
            Open Command Center
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </section>

      {/* Enterprise footer */}
      <footer className="relative z-10 border-t border-omniv-border bg-omniv-elevated">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="" width={24} height={24} className="rounded" />
                <span className="text-sm font-semibold">Omniv</span>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-omniv-text-secondary">
                Intelligence platform for independent artists, managers, and
                labels. Strategy infrastructure for the streaming era.
              </p>
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-text-muted">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>
                  <a href="#platform" className="hover:text-omniv-text">
                    Command Center
                  </a>
                </li>
                <li>
                  <a href="#platform" className="hover:text-omniv-text">
                    Artist Brain
                  </a>
                </li>
                <li>
                  <a href="#platform" className="hover:text-omniv-text">
                    Ziki AI
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-omniv-text">
                    Get started
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
                <li>A&R teams</li>
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
              Built for the independent era · Black · Gold · Intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
