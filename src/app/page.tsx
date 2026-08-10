"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  MessageSquare,
  Radio,
  Ticket,
  Users,
  Brain,
  Banknote,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

function useMotionSafe() {
  return !useReducedMotion();
}

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px" }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function GoldShimmer({ children }: { children: ReactNode }) {
  return <span className="text-omniv-gold">{children}</span>;
}

export default function LandingPage() {
  const animate = useMotionSafe();
  const heroContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
  };
  const heroItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };

  const steps = [
    {
      n: "01",
      t: "Tell Omniv who you are",
      d: "Genre, stage, platforms, Big Dream. Everything positions around what you are building.",
    },
    {
      n: "02",
      t: "Own your audience",
      d: "Fan Gate captures email, city, and who would show up. Not followers you rent from an algorithm.",
    },
    {
      n: "03",
      t: "Host a room. Get paid.",
      d: "Open a gathering link for any city. Free or ticketed. Tips on the same page. First cash without a label.",
    },
    {
      n: "04",
      t: "Move on ranked priority",
      d: "Ziki and Command Center surface the highest-impact next move — not a feed of equal tips.",
    },
  ];

  const pillars = [
    {
      icon: Brain,
      t: "Career OS",
      d: "Artist Brain, scores, opportunities tied to your goals. One priority when it matters.",
    },
    {
      icon: Users,
      t: "Owned fans",
      d: "Cities, intent to attend, tiers. The map of who will actually show up.",
    },
    {
      icon: Ticket,
      t: "Rooms and revenue",
      d: "Public event links, RSVP, tickets, tip jar. Money without waiting for a deal.",
    },
    {
      icon: MessageSquare,
      t: "Ziki",
      d: "Manager-grade chat: strategy, deal emails in your voice, tasks, release stress-tests.",
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-omniv-black text-omniv-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.09),_transparent_55%)]" />

      <header className="relative z-20 border-b border-omniv-border/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
            <span className="text-sm font-semibold tracking-tight">Omniv</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-9 text-[13px]">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-9 text-[13px]">
                Free scan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-12 pt-14 text-center md:px-8 md:pt-20">
        <motion.div
          variants={heroContainer}
          initial={animate ? "hidden" : false}
          animate="show"
        >
          <motion.p
            variants={heroItem}
            className="mb-4 font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold"
          >
            For artists who stopped waiting for a label
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]"
          >
            Stop renting your audience.
            <br />
            <GoldShimmer>Own the list. Open the room.</GoldShimmer>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-omniv-text-secondary md:text-[17px]"
          >
            The algorithm doesn't care about your talent. Omniv helps you
            build fans you own, map who shows up in which city, take tickets and
            tips on your link, and get one ranked move from Ziki — your AI
            manager who never sleeps.
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/signup">
              <Button size="lg" className="h-12 min-w-[200px] gap-2 text-sm">
                Free artist scan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how">
              <Button variant="outline" size="lg" className="h-12 min-w-[200px] text-sm">
                How it works
              </Button>
            </a>
          </motion.div>
          <motion.p
            variants={heroItem}
            className="mt-5 text-[12px] text-omniv-text-muted"
          >
            Free scan · Owned fans · Rooms that take money · One move from Ziki
          </motion.p>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-omniv-border bg-omniv-elevated/40">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-10 md:grid-cols-3 md:px-8">
          {[
            {
              t: "Broke but talented",
              d: "No label advance. No manager at $3k/month. You still need a room, a link, and the next move.",
            },
            {
              t: "Invisible on Instagram",
              d: "500 followers. 12 likes. 0 bookings. Stop renting reach — own the list who would show up.",
            },
            {
              t: "Exhausted from guessing",
              d: "Release day, caption, city — ranked once. Highest impact. Lowest effort.",
            },
          ].map((c) => (
            <FadeUp key={c.t}>
              <p className="text-sm font-medium">{c.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-omniv-text-muted">
                {c.d}
              </p>
            </FadeUp>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
        <FadeUp>
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
            How Omniv works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Four moves. One system.
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {steps.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.05}>
              <div className="rounded-2xl border border-omniv-border bg-omniv-card/60 p-5">
                <span className="font-data text-[11px] text-omniv-gold">{s.n}</span>
                <h3 className="mt-2 text-base font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-omniv-text-secondary">
                  {s.d}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-t border-omniv-border bg-omniv-elevated/30">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
          <FadeUp>
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
              Inside the product
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Built to run a career, not a moodboard
            </h2>
          </FadeUp>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <FadeUp key={p.t} delay={i * 0.04}>
                <div className="flex gap-3 rounded-2xl border border-omniv-border bg-omniv-card/50 p-5">
                  <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-omniv-gold" />
                  <div>
                    <h3 className="text-sm font-semibold">{p.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-omniv-text-secondary">
                      {p.d}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-16 md:px-8">
        <FadeUp>
          <div className="rounded-2xl border border-omniv-gold/25 bg-omniv-gold/5 p-6 md:p-8">
            <div className="flex items-start gap-3">
              <Banknote className="mt-0.5 h-5 w-5 text-omniv-gold" />
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Money without a Flutterwave account
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-omniv-text-secondary">
                  Fans pay on your room link. Omniv collects. You save bank or
                  MoMo details once. You get paid out — no RS codes, no developer
                  setup. Create as many event links as you need.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-omniv-text-secondary">
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
                    See which city has the most fans ready to attend
                  </li>
                  <li className="flex gap-2">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
                    Edit every room after you create it
                  </li>
                  <li className="flex gap-2">
                    <Radio className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
                    Free public relevance audit from Spotify or YouTube
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="relative z-10 border-t border-omniv-border bg-omniv-elevated/40">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <FadeUp>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Your music deserves more than a like. It deserves a room.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-omniv-text-secondary">
              Free scan. Own the list. Open a room that takes tickets and tips.
              Ziki ranks the one move that matters this week.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="h-12 min-w-[200px] gap-2">
                  Free artist scan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" size="lg" className="h-12 min-w-[200px]">
                  See how it works
                </Button>
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      <footer className="relative z-10 border-t border-omniv-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-center text-xs text-omniv-text-muted md:flex-row md:px-8 md:text-left">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={18} height={18} className="rounded" />
            <span>Omniv · Know your next move</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-omniv-text">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-omniv-text">
              Terms
            </Link>
            <Link href="/login" className="hover:text-omniv-text">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
