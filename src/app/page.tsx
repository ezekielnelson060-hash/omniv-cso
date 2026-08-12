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
  Sparkles,
  Users,
  DoorOpen,
  Banknote,
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
    q: "Streams almost never pay the rent.",
    a: "A million plays can still be tiny money. Omniv helps you sell rooms, tips, and tickets to people who already care.",
  },
  {
    q: "You don’t know who would actually show up.",
    a: "Followers are not fans in a seat. Omniv uses your own list and “would attend” answers to guess turnout and ticket price.",
  },
  {
    q: "You open the app and freeze: what this week?",
    a: "Agent shows outside chances (labels, sync, playlists). Moves gives you the next clear step — not another pile of ideas.",
  },
];

const STEPS = [
  {
    n: "1",
    t: "Tell Omniv about you",
    d: "Share your goal, style, and city. Upload a track if you have one. This is your Artist Brain.",
  },
  {
    n: "2",
    t: "Build a list you own",
    d: "Share your fan gate link. Fans leave email, city, and if they would come to a show. That data is yours.",
  },
  {
    n: "3",
    t: "See who would show up",
    d: "Omniv turns the list into a simple line: city, how many might come, ticket idea, room size.",
  },
  {
    n: "4",
    t: "Do one move",
    d: "Open a room, post a tip link, or draft a pitch. Agent watches the market. Moves is the to-do list.",
  },
];

const BRIEFS = [
  "Lagos: 80 fans, 15% say they would attend, try a $5 ticket, room about 50 people.",
  "Accra: 42 fans, 22% would attend, try $5, room about 30 people.",
  "London: 120 fans, 9% would attend, try $8, room about 80 people.",
];

const PRODUCT = [
  {
    icon: MapPin,
    t: "Show-up math",
    d: "Not vanity listeners. Your fans × who said they would come → ticket idea → room size. One line you can act on.",
  },
  {
    icon: Radio,
    t: "Outside intelligence",
    d: "Agent looks for label, sync, and playlist signals. You get the news. You decide what to pitch.",
  },
  {
    icon: ListChecks,
    t: "Moves (the plan)",
    d: "Clear steps: open a room, put the tip link in your bio, send one email. No vague “hustle harder.”",
  },
  {
    icon: Wallet,
    t: "Money you keep",
    d: "Tip links and paid rooms. Fans pay you. Omniv takes a small cut. Payout goes toward your account.",
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
            <Image src="/logo.svg" alt="Omniv" width={30} height={30} className="rounded-lg" />
            <span className="text-[15px] font-semibold tracking-tight">Omniv</span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] text-zinc-400 md:flex">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#product" className="hover:text-white">Product</a>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-9 text-[13px] text-zinc-400 hover:text-white">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-9 rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black hover:bg-omniv-gold/90">Start free</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-12 md:px-8 md:pt-20">
        <motion.div className="mx-auto max-w-3xl text-center" variants={heroContainer} initial={animate ? "hidden" : false} animate="show">
          <motion.p variants={heroItem} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-omniv-gold">
            <Sparkles className="h-3 w-3" />
            AI career help for independent artists
          </motion.p>
          <motion.h1 variants={heroItem} className="mt-6 text-[2.15rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Stop guessing what to do next.
            <br />
            <span className="bg-gradient-to-r from-omniv-gold via-amber-200 to-omniv-gold bg-clip-text text-transparent">
              Know who shows up. Open a room. Get paid.
            </span>
          </motion.h1>
          <motion.p variants={heroItem} className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400 md:text-base">
            Omniv is a simple career tool for artists who release music without a big team. It ranks your best next move, helps you collect fans you own, and helps you sell tickets and tips — not just chase streams.
          </motion.p>
          <motion.div variants={heroItem} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button className="h-12 rounded-full bg-omniv-gold px-8 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
                Try Omniv free
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" className="h-12 rounded-full border-white/15 bg-transparent px-6 text-[14px] text-zinc-300 hover:bg-white/5">
                Read short guides
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={heroItem} className="mt-4 text-[12px] text-zinc-600">
            No credit card to start. Built for independents, managers, and small labels.
          </motion.p>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">Sound familiar?</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Most apps show old charts.
            <span className="text-zinc-500"> Omniv helps you pick the next action.</span>
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <FadeUp key={p.q} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[15px] font-semibold text-zinc-200">{p.q}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{p.a}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">How Omniv works</p>
          <h2 className="mx-auto mt-2 max-w-xl text-center text-2xl font-semibold tracking-tight md:text-3xl">Four steps. No jargon.</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] text-zinc-500">
            You do not need a label or a big budget. You need a clear next step and a list of real fans.
          </p>
        </FadeUp>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.05}>
              <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15 text-[15px] font-bold text-omniv-gold">{s.n}</div>
                <div>
                  <p className="text-[15px] font-semibold">{s.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{s.d}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.2}>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-[12px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-omniv-gold" /> Own your fans</span>
            <span className="inline-flex items-center gap-1.5"><DoorOpen className="h-3.5 w-3.5 text-omniv-gold" /> Open a room</span>
            <span className="inline-flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5 text-omniv-gold" /> Get paid</span>
          </div>
        </FadeUp>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-8">
        <FadeUp>
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-1 shadow-2xl shadow-black/50">
            <div className="rounded-[1.35rem] bg-[#0a0a0a] p-5 md:p-7">
              <p className="font-data text-[10px] uppercase tracking-[0.2em] text-omniv-gold">Example demand line</p>
              <p className="mt-1 text-[13px] text-zinc-500">After fans join your gate and mark “would attend,” Omniv can talk like this:</p>
              <ul className="mt-4 space-y-3">
                {BRIEFS.map((line) => (
                  <li key={line} className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-left text-[13px] leading-snug text-zinc-300">{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeUp>
      </section>

      <section id="product" className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">What’s inside</p>
          <h2 className="mx-auto mt-2 max-w-xl text-center text-2xl font-semibold tracking-tight md:text-3xl">Intelligence. Plan. Cash.</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] text-zinc-500">Agent is the news and chances outside you. Moves is your checklist. Money is tips and tickets.</p>
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
                  <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{item.d}</p>
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Before</p>
              <p className="mt-3 text-[17px] font-medium leading-snug text-zinc-400">“I don’t know what to do this week.”</p>
            </div>
            <div className="rounded-2xl border border-omniv-gold/25 bg-omniv-gold/5 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">After</p>
              <p className="mt-3 text-[17px] font-medium leading-snug text-zinc-100">“Open a room in Accra. Put the tip link in my bio. Pitch one playlist.”</p>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 text-center md:px-8">
        <FadeUp>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to stop guessing?</h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-500">Sign up free. Scan your artist brain. See one clear move for this week.</p>
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
                <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-lg" />
                <span className="text-[15px] font-semibold">Omniv</span>
              </Link>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                AI career strategist for independent artists. Ranked moves, fan gates, ticketed rooms, and tips — so you know what to do next.
              </p>
              <p className="mt-4 text-[12px] text-zinc-600">omniv.media</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Product</p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li><a href="#how" className="hover:text-zinc-200">How it works</a></li>
                <li><a href="#product" className="hover:text-zinc-200">What’s inside</a></li>
                <li><Link href="/signup" className="hover:text-zinc-200">Start free</Link></li>
                <li><Link href="/login" className="hover:text-zinc-200">Log in</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Resources</p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li><Link href="/blog" className="hover:text-zinc-200">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-zinc-200">Contact</Link></li>
                <li><Link href="/policy" className="hover:text-zinc-200">Policies</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Legal</p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li><Link href="/privacy" className="hover:text-zinc-200">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-zinc-200">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-zinc-200">Cookies</Link></li>
                <li><Link href="/data-deletion" className="hover:text-zinc-200">Data deletion</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-[12px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <span>© {year} Omniv. All rights reserved.</span>
            <span>For independent artists</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
