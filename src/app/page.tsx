"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

function useMotionSafe() {
  const reduce = useReducedMotion();
  return !reduce;
}

function FadeUp({
  children,
  className,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px 0px" }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Stagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const animate = useMotionSafe();
  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.09, delayChildren: delay },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease },
    },
  };
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-30px 0px" }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

function GoldShimmer({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block text-omniv-gold">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent bg-[length:200%_100%] animate-[shimmer_2.8s_ease-in-out_infinite] bg-clip-text text-transparent"
        style={{ WebkitBackgroundClip: "text" }}
      >
        {children}
      </span>
    </span>
  );
}

export default function LandingPage() {
  const animate = useMotionSafe();

  const heroContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
  };
  const heroItem: Variants = {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease },
    },
  };

  const costCards = [
    {
      t: "Lost windows",
      d: "A release on the wrong week doesn't come back. Timing is a one-shot asset.",
    },
    {
      t: "Scattered focus",
      d: "Five priorities feel productive. One ranked move builds a career.",
    },
    {
      t: "Roster fog",
      d: "Managers who run acts from memory quietly rank by whoever shouted last.",
    },
  ];

  const systemCards = [
    {
      t: "Command Center",
      d: "The state of the career in one glance — momentum, audience, content, release readiness — with this week's non-negotiable on top.",
    },
    {
      t: "Opportunity Feed",
      d: "Moves ranked by impact. Why it matters. When. Expected outcome. Act on this opens execution in Ziki — not another brainstorm.",
    },
    {
      t: "Release Simulator",
      d: "Stress-test the window before you spend reputation and budget. Go. Caution. Hold. Most people only learn the answer after the drop.",
    },
  ];

  const steps = [
    {
      n: "01",
      t: "Lock your context",
      d: "Genre, stage, goals, platforms. This becomes Artist Brain — the private context most AI tools never hold.",
    },
    {
      n: "02",
      t: "Receive the priority",
      d: "One move. Ranked. Explained. Not a menu of options designed to make you feel busy.",
    },
    {
      n: "03",
      t: "Execute with Ziki",
      d: "Plans, tasks, release checks. Memory stays with the project so next week isn't a reset.",
    },
  ];

  const personas = [
    {
      t: "Artists",
      d: "Walk out with one non-negotiable for the week. Stop performing productivity. Start compounding the right move.",
    },
    {
      t: "Lean managers",
      d: "See which act gets this hour. Roster clarity without a full war room — before focus becomes politics.",
    },
    {
      t: "Small labels",
      d: "Release-ready vs needs priming. Attention is finite. Omniv ranks where it should go.",
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-omniv-bg text-omniv-text">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 left-1/2 h-[560px] w-[920px] -translate-x-1/2 rounded-full bg-omniv-gold/[0.07] blur-[130px]"
          animate={animate ? { opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] } : undefined}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-omniv-gold/[0.04] blur-[100px]"
          animate={animate ? { opacity: [0.35, 0.6, 0.35] } : undefined}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
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
            <a href="#intelligence" className="transition-colors hover:text-omniv-text">
              Intelligence
            </a>
            <a href="#how" className="transition-colors hover:text-omniv-text">
              Access
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
                Request access
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-10 pt-12 text-center md:px-8 md:pb-12 md:pt-16">
        <motion.div
          variants={heroContainer}
          initial={animate ? "hidden" : false}
          animate="show"
        >
          <motion.p
            variants={heroItem}
            className="mb-4 font-data text-[11px] uppercase tracking-[0.22em] text-omniv-gold"
          >
            Private career intelligence · Independent music
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="text-balance text-[2.4rem] font-semibold leading-[1.06] tracking-tight md:text-5xl lg:text-[3.4rem]"
          >
            Most artists will never know
            <br />
            <GoldShimmer>what they should have done</GoldShimmer>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-omniv-text-secondary md:text-[17px]"
          >
            While everyone else posts, guesses, and burns release windows, a small
            set of operators will run on ranked priorities, release timing, and
            roster clarity. Omniv is that system — career intelligence built like
            an inner circle, not another public dashboard.
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 min-w-[200px] gap-2 text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter the system
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#intelligence">
              <Button
                variant="outline"
                size="lg"
                className="h-12 min-w-[200px] text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                See the architecture
              </Button>
            </a>
          </motion.div>
          <motion.p
            variants={heroItem}
            className="mt-5 text-[12px] text-omniv-text-muted"
          >
            Free to start · Built for independents who refuse to wing another year
          </motion.p>
        </motion.div>
      </section>

      {/* COST OF INACTION */}
      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/50">
        <div className="mx-auto max-w-3xl px-5 py-10 text-center md:px-8 md:py-12">
          <FadeUp>
            <p className="font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
              The invisible tax
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Guessing compounds. Clarity compounds faster.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-omniv-text-secondary md:text-base">
              Every wrong week, scattered campaign, and “I'll figure it out”
              month is a decision you can't refund. Independents don't
              usually fail from zero talent — they fail from years of motion
              without a ranked next move. The artists and managers who pull ahead
              are not luckier. They stop improvising the strategy layer.
            </p>
          </FadeUp>
          <Stagger className="mt-8 grid gap-3 text-left sm:grid-cols-3" delay={0.1}>
            {costCards.map((item) => (
              <div
                key={item.t}
                className="rounded-xl border border-omniv-border bg-omniv-card/80 p-4 transition-colors duration-300 hover:border-omniv-gold/30"
              >
                <p className="text-[13px] font-semibold text-omniv-gold">{item.t}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-omniv-text-secondary">
                  {item.d}
                </p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section
        id="intelligence"
        className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14"
      >
        <FadeUp className="max-w-2xl">
          <p className="font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
            The system
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Intelligence, not noise
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-omniv-text-secondary">
            Omniv is structured like a private strategist: it holds your stage,
            goals, and platforms — then returns one highest-impact move. No
            feed of equal tips. No vanity metrics theater. Operators who use it
            stop asking “what should I post?” and start executing a ranked plan.
          </p>
        </FadeUp>

        <Stagger className="mt-8 grid gap-4 md:grid-cols-3" delay={0.08}>
          {systemCards.map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-omniv-border bg-omniv-card p-5 transition-all duration-300 hover:border-omniv-gold/25 hover:shadow-[0_12px_40px_-16px_rgba(212,175,55,0.18)] md:p-6"
            >
              <h3 className="text-base font-semibold tracking-tight">{card.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-omniv-text-secondary">
                {card.d}
              </p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ACCESS */}
      <section
        id="how"
        className="relative z-10 border-y border-omniv-border bg-omniv-elevated/30"
      >
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
          <FadeUp className="max-w-xl">
            <p className="font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
              Access path
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              From profile to advantage in three steps
            </h2>
          </FadeUp>
          <Stagger className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6" delay={0.1}>
            {steps.map((s) => (
              <div key={s.n}>
                <p className="font-data text-sm text-omniv-gold">{s.n}</p>
                <h3 className="mt-2 text-base font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-omniv-text-secondary">
                  {s.d}
                </p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* WHO */}
      <section
        id="for"
        className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12"
      >
        <FadeUp className="max-w-2xl">
          <p className="font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
            Who this is built for
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Serious independents. Not spectators.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-omniv-text-secondary">
            Omniv is for operators who already know talent isn't enough —
            early-stage artists building with intent, lean managers running
            developing rosters, small labels allocating attention under
            constraint. It is not a substitute for agents, lawyers, or A-list
            dealmaking. It is the strategy layer almost no one around you is
            running yet.
          </p>
        </FadeUp>
        <Stagger className="mt-8 grid gap-4 md:grid-cols-3" delay={0.08}>
          {personas.map((r) => (
            <div
              key={r.t}
              className="rounded-2xl border border-omniv-border bg-omniv-card p-5 transition-all duration-300 hover:border-omniv-gold/25 md:p-6"
            >
              <h3 className="text-base font-semibold tracking-tight">{r.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-omniv-text-secondary">
                {r.d}
              </p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* LINE IN THE SAND */}
      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/60">
        <div className="mx-auto max-w-3xl px-5 py-10 text-center md:py-12">
          <FadeUp>
            <p className="text-xl font-semibold tracking-tight md:text-2xl md:leading-snug">
              In two years, the gap won't be talent.
              <br />
              It will be who ran on intelligence — and who kept guessing.
            </p>
            <p className="mt-4 font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
              Omniv · Highest-impact move. Every week.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 py-12 text-center md:py-14">
        <FadeUp>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            The cost of waiting is another cycle you can't buy back
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-omniv-text-secondary">
            Create an account. Complete onboarding. Get your first priority the
            same day. The operators who start now won't explain later why they
            delayed.
          </p>
          <Link href="/signup" className="mt-7 inline-block">
            <Button
              size="lg"
              className="h-12 gap-2 px-10 text-sm transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              Enter the system
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-[12px] text-omniv-text-muted">
            Free tier available · Upgrade when the roster demands it
          </p>
        </FadeUp>
      </section>

      <footer className="relative z-10 border-t border-omniv-border bg-omniv-elevated">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                Private career intelligence for independent music operators.
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-omniv-text">Product</p>
              <ul className="mt-3 space-y-2 text-[13px] text-omniv-text-secondary">
                <li>
                  <a href="#intelligence" className="hover:text-omniv-text">
                    Intelligence
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-omniv-text">
                    Access
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-omniv-text">
                    Enter
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
          <div className="mt-8 flex flex-col gap-2 border-t border-omniv-border pt-5 sm:flex-row sm:items-center sm:justify-between">
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
