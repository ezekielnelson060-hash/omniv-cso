import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  BarChart3,
  Radio,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

const PROBLEMS = [
  {
    title: "Strategy is scattered",
    body: "Playlists, TikTok trends, release timing, and brand decisions live in different tabs — none of them talk to each other.",
  },
  {
    title: "AI tools stop at content",
    body: "Most music AI writes captions or stems. Almost none act like a chief strategy officer who knows your catalogue and career stage.",
  },
  {
    title: "Independents compete blind",
    body: "Labels still have A&R rooms. Independents need the same clarity: what to do next, why, when, and expected outcome.",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Artist Brain",
    desc: "Permanent memory of style, audience, goals, and gaps. Every recommendation is grounded in you — not a generic prompt.",
  },
  {
    icon: Target,
    title: "Opportunity Feed",
    desc: "Trends, collabs, release windows, and content plays ranked by impact, difficulty, and confidence.",
  },
  {
    icon: BarChart3,
    title: "Command Center scores",
    desc: "Growth, momentum, audience health, release readiness — executive KPIs, not vanity charts.",
  },
  {
    icon: Sparkles,
    title: "Ziki — AI CSO",
    desc: "Ask anything. Ziki answers as a briefing: what, why, when, how, priority, expected outcome.",
  },
  {
    icon: Radio,
    title: "Release Simulator",
    desc: "Stress-test timing, competition, and marketing before you spend the budget.",
  },
  {
    icon: Users,
    title: "Manager & Label views",
    desc: "Multi-artist CRM and roster intelligence when you outgrow solo mode.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-omniv-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-omniv-gold/6 blur-[140px]" />
        <div className="absolute bottom-20 right-0 h-[360px] w-[480px] rounded-full bg-omniv-gold/4 blur-[120px]" />
        <div className="absolute left-0 top-1/3 h-[200px] w-[200px] rounded-full bg-omniv-gold/3 blur-[80px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omniv-gold/15 glow-gold">
            <span className="text-base font-bold text-omniv-gold">O</span>
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">Omniv</span>
            <span className="ml-2 hidden text-[10px] uppercase tracking-widest text-omniv-text-muted sm:inline">
              Artist OS
            </span>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-omniv-text-secondary md:flex">
          <a href="#problem" className="hover:text-omniv-text">
            Why Omniv
          </a>
          <a href="#product" className="hover:text-omniv-text">
            Product
          </a>
          <a href="#who" className="hover:text-omniv-text">
            Who it&apos;s for
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-omniv-gold/25 bg-omniv-gold/8 px-3.5 py-1.5 text-xs font-medium text-omniv-gold">
          <Sparkles className="h-3.5 w-3.5" />
          AI Chief Strategy Officer for independent music
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight text-omniv-text md:text-6xl md:leading-[1.08]">
          Know the highest-impact move
          <br />
          <span className="text-omniv-gold">for your career.</span>
          <br />
          Every single day.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-omniv-text-secondary md:text-lg">
          Omniv is not another caption generator. It is a continuous strategy
          engine for artists, managers, and labels — built for an industry where
          attention is fragmented, releases are weekly, and independent careers
          win on clarity, not luck.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="min-w-[200px] gap-2">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#product">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              See the product
            </Button>
          </a>
        </div>

        <p className="mt-6 text-xs text-omniv-text-muted">
          Built for Afrobeats, amapiano, alté, hip-hop, and the global independent
          circuit · Powered by Artist Brain + Ziki
        </p>
      </section>

      <section
        id="problem"
        className="relative z-10 mx-auto max-w-5xl px-6 pb-24"
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-omniv-gold">
            The industry problem
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Music moved online. Strategy didn&apos;t.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-omniv-text-secondary">
            Streaming, short-form video, playlists, and direct-to-fan channels
            created more surface area than any artist can manually optimize.
            Omniv turns that noise into a single question: what should we do
            next?
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-elevated/60 p-5"
            >
              <h3 className="text-sm font-semibold text-omniv-text">{p.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-omniv-text-secondary">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-omniv-gold">
            The product
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            A Chief Strategy Officer that never clocks out
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="card-elevated flex flex-col gap-3 p-5 transition-colors hover:border-omniv-gold/25"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omniv-gold/10">
                <item.icon className="h-4 w-4 text-omniv-gold" />
              </div>
              <h3 className="text-sm font-semibold text-omniv-text">{item.title}</h3>
              <p className="text-xs leading-relaxed text-omniv-text-secondary">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="who" className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: "Artists",
              body: "Solo strategy OS — scores, opportunities, and Ziki briefings tuned to your stage.",
            },
            {
              icon: Users,
              title: "Managers",
              body: "Multi-artist CRM and prioritisation so the right career gets the next hour.",
            },
            {
              icon: Shield,
              title: "Labels",
              body: "Roster health, release readiness, and portfolio-level moves in one place.",
            },
          ].map((r) => (
            <div
              key={r.title}
              className="glass-gold rounded-[var(--radius-xl)] p-6"
            >
              <r.icon className="h-5 w-5 text-omniv-gold" />
              <h3 className="mt-3 text-base font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-omniv-text-secondary">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-28 text-center">
        <div className="rounded-[var(--radius-xl)] border border-omniv-gold/30 bg-omniv-gold/8 px-8 py-12">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Stop guessing. Start executing.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-omniv-text-secondary">
            Create an account, complete Artist Brain onboarding, and get your
            first executive briefing in minutes.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="min-w-[200px] gap-2">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-omniv-border py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-xs text-omniv-text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Omniv. Strategy for the independent era.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-omniv-text">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-omniv-text">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
