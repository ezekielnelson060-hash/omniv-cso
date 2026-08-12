"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  Radio,
  Wallet,
  ListChecks,
  Globe2,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

function useMotionSafe() {
  const reduce = useReducedMotion();
  return !reduce;
}

function FadeUp({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const animate = useMotionSafe();
  if (!animate) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

const PAINS = [
  {
    q: "Streams pay cents.",
    a: "Rooms, tips, and tickets go to your bank — not another dashboard of vanity plays.",
  },
  {
    q: "You don’t know who would show up.",
    a: "Omniv turns owned fans + intent into one line: city, turnout, ticket, venue size.",
  },
  {
    q: "“What do I do this week?”",
    a: "Agent brings outside deals. Moves is the execution plan — not another moodboard.",
  },
];

const BRIEFS = [
  "Lagos: 80 fans, 15% intent-to-attend, optimal ticket $5, recommended venue: 50-cap coffee shop.",
  "Accra: 42 fans, 22% intent-to-attend, optimal ticket $5, recommended venue: 30-cap living-room.",
  "London: 120 fans, 9% intent-to-attend, optimal ticket $8, recommended venue: 80-cap bar.",
];

const PRODUCT = [
  {
    icon: MapPin,
    t: "Show-up math",
    d: "Fans × would-attend → price → room size. One sentence you can book against.",
  },
  {
    icon: Radio,
    t: "Outside intelligence",
    d: "Labels, sync, playlists, market signals — global, not one scene. Agent surfaces; you decide.",
  },
  {
    icon: ListChecks,
    t: "Precision Moves",
    d: "Numbered actions: open a room, draft a pitch, put the tip link in bio. Execution, not theory.",
  },
  {
    icon: Wallet,
    t: "Money you own",
    d: "Tip links and ticketed gatherings. Split to your account. Built for independents worldwide.",
  },
];

export default function LandingPage() {
  const animate = useMotionSafe();
  const heroContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const heroItem: Variants = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
  };
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050505] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.16),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,80,255,0.08),transparent_40%)]" />

      <header className="relative z-20 border-b border-white/[0.04]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span className="text-[15px] font-semibold tracking-tight">
              Omniv
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] text-zinc-400 md:flex">
            <a href="#product" className="hover:text-white">
              Product
            </a>
            <a href="#proof" className="hover:text-white">
              Demand
            </a>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-[13px] text-zinc-400 hover:text-white"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="h-9 rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black hover:bg-omniv-gold/90"
              >
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-12 md:px-8 md:pt-20">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={heroContainer}
          initial={animate ? "hidden" : false}
          animate="show"
        >
          <motion.p
            variants={heroItem}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-omniv-gold"
          >
            <Globe2 className="h-3 w-3" />
            Global career OS for independent artists & labels
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="mt-6 text-[2.15rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
          >
            Streams don’t pay.
            <br />
            <span className="bg-gradient-to-r from-omniv-gold via-amber-200 to-omniv-gold bg-clip-text text-transparent">
              Your fans will — if you know who shows up.
            </span>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400 md:text-base"
          >
            Omniv is the intelligence layer between your catalogue and cash:
            city demand math, outside market signals, tip links, and ticketed
            rooms — built for artists in Lagos, London, LA, and everywhere
            between.
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/signup">
              <Button className="h-12 rounded-full bg-omniv-gold px-8 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
                Run free artist scan
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-transparent px-6 text-[14px] text-zinc-300 hover:bg-white/5"
              >
                Read the playbook
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">
            The problem
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Most “artist tools” show what already happened.
            <span className="text-zinc-500">
              {" "}
              Omniv tells you what to do next.
            </span>
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <FadeUp key={p.q} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[15px] font-semibold text-zinc-200">{p.q}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                  {p.a}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section
        id="proof"
        className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-8"
      >
        <FadeUp>
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-1 shadow-2xl shadow-black/50">
            <div className="rounded-[1.35rem] bg-[#0a0a0a] p-5 md:p-7">
              <p className="font-data text-[10px] uppercase tracking-[0.2em] text-omniv-gold">
                Live demand brief
              </p>
              <p className="mt-1 text-[13px] text-zinc-500">
                From owned fans + intent — not public follower counts.
              </p>
              <ul className="mt-4 space-y-3">
                {BRIEFS.map((line) => (
                  <li
                    key={line}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-left text-[13px] leading-snug text-zinc-300"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeUp>
      </section>

      <section
        id="product"
        className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8"
      >
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">
            Product
          </p>
          <h2 className="mx-auto mt-2 max-w-xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            One system: intelligence → plan → cash
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PRODUCT.map((item, i) => (
            <FadeUp key={item.t} delay={i * 0.05}>
              <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
                  <item.icon className="h-5 w-5 text-omniv-gold" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">{item.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
                    {item.d}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-8">
        <FadeUp>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Before Omniv
              </p>
              <p className="mt-3 text-[17px] font-medium leading-snug text-zinc-400">
                “I don’t know what to do this week.”
              </p>
            </div>
            <div className="rounded-2xl border border-omniv-gold/25 bg-omniv-gold/5 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
                After Omniv
              </p>
              <p className="mt-3 text-[17px] font-medium leading-snug text-zinc-100">
                “Open room in Accra. Pitch the sync. Drop Friday. Tip link in
                bio.”
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 text-center md:px-8">
        <FadeUp>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Stop guessing. Run the scan.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-500">
            Free to start. Built for independents and labels — Africa, Americas,
            Europe, Asia.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button className="h-12 rounded-full bg-omniv-gold px-10 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
              Start free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </FadeUp>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-[#070707]">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/logo.svg"
                  alt="Omniv"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-[15px] font-semibold">Omniv</span>
              </Link>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                Career intelligence for independent artists and labels. Demand
                math, outside signals, rooms, and payouts — worldwide.
              </p>
              <p className="mt-4 text-[12px] text-zinc-600">omniv.media</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li>
                  <a href="#product" className="hover:text-zinc-200">
                    Platform
                  </a>
                </li>
                <li>
                  <a href="#proof" className="hover:text-zinc-200">
                    Demand briefs
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-zinc-200">
                    Start free
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-zinc-200">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Resources
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li>
                  <Link href="/blog" className="hover:text-zinc-200">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-zinc-200">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/policy" className="hover:text-zinc-200">
                    Policies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Legal
              </p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li>
                  <Link href="/privacy" className="hover:text-zinc-200">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-zinc-200">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-zinc-200">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/data-deletion" className="hover:text-zinc-200">
                    Data deletion
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-[12px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <span>© {year} Omniv. All rights reserved.</span>
            <span>Independent artists · Labels · Global</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
