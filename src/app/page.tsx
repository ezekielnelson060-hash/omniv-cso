"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  ListChecks,
  Users,
  CalendarRange,
  Music2,
  Radio,
  Wallet,
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
            <a href="#ecosystem" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-9 text-[13px] text-zinc-400 hover:text-white">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-9 rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black hover:bg-omniv-gold/90">Launch free</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-12 md:px-8 md:pt-20">
        <motion.div className="mx-auto max-w-3xl text-center" variants={heroContainer} initial={animate ? "hidden" : false} animate="show">
          <motion.p variants={heroItem} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-omniv-gold">
            <Sparkles className="h-3 w-3" />
            One bio link. Own the list. Open the room. Get paid.
          </motion.p>
          <motion.h1 variants={heroItem} className="mt-6 text-[2.1rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-[3.25rem]">
            You already have fans.
            <br />
            <span className="bg-gradient-to-r from-omniv-gold via-amber-200 to-omniv-gold bg-clip-text text-transparent">
              Omniv shows who would show up.
            </span>
          </motion.h1>
          <motion.p variants={heroItem} className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400 md:text-base">
            Linktree shows links. Spotify shows streams.{" "}
            <span className="text-zinc-200">Omniv shows demand</span> — city, intent, tip, room — then ranks what to do next. Same week. Not next year.
          </motion.p>
          <motion.div variants={heroItem} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button className="h-12 rounded-full bg-omniv-gold px-8 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
                Claim your artist page free
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <a href="#blueprint" className="text-[14px] font-medium text-zinc-400 underline-offset-4 hover:text-omniv-gold hover:underline">
              See a live demand line →
            </a>
          </motion.div>
          <motion.p variants={heroItem} className="mt-5 text-[12px] text-zinc-600">
            Fan gate · Rooms · Tips · Ranked moves · Ziki — one OS.
          </motion.p>
        </motion.div>

        <FadeUp delay={0.2}>
          <div id="blueprint" className="relative mx-auto mt-14 max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-1 shadow-2xl shadow-black/50">
            <div className="rounded-[1.35rem] bg-[#0a0a0a] p-5 md:p-7">
              <div className="flex items-center justify-between gap-2">
                <p className="font-data text-[10px] uppercase tracking-[0.2em] text-omniv-gold">This week’s demand line</p>
                <span className="rounded-full bg-omniv-gold/15 px-2 py-0.5 text-[10px] font-medium text-omniv-gold">Ziki</span>
              </div>
              <ul className="mt-4 space-y-2.5 text-left text-[13px] text-zinc-300">
                <li className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <span className="text-omniv-gold">1.</span> One bio link live — song, story, email + city, tip
                </li>
                <li className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <span className="text-omniv-gold">2.</span> Lagos: ~80 on the list · 15% said they&apos;d come · $5 · ~50-cap room
                </li>
                <li className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <span className="text-omniv-gold">3.</span> Open the room. Tip sits on the same page. Share once.
                </li>
              </ul>
              <p className="mt-4 text-left text-[12px] text-zinc-600">
                Not a hype quote. A line from your data — fans × intent → ticket × room.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">The trap vs the system</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Same phone. Same songs. Different outcome.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] text-zinc-500">
            You can keep posting into the void — or run a page that captures demand and pays you.
          </p>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <FadeUp>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Without Omniv</p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-zinc-400">
                <li>Bio is five dead links. Nobody joins a list you own.</li>
                <li>Streams look loud. The room stays empty.</li>
                <li>You tip… nowhere. Money never lands on your page.</li>
                <li>You still don&apos;t know <span className="text-zinc-300">who would show up</span>.</li>
              </ul>
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="h-full rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">With Omniv</p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-zinc-200">
                <li>One artist page: story · song · list · tip.</li>
                <li>Fan gate: email + city + “I&apos;d come.”</li>
                <li>Rooms you open. Tips that hit your payout.</li>
                <li>Demand lines + ranked moves — so the next step isn&apos;t a guess.</li>
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      <section id="ecosystem" className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">Inside the OS</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Own the list. Open the room. Get paid. Repeat.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[14px] text-zinc-500">
            Familiar tools — bio, tips, tickets — wired so they finally work together.
          </p>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              t: "Artist page + fan gate",
              d: "One link in bio. Song. Story. Email + city + would-attend. Tips on the same page. Not another dead Linktree — a demand machine you own.",
            },
            {
              icon: CalendarRange,
              t: "Rooms",
              d: "When a city lights up, open a ticketed room. Share the link. Seat the people who already said yes. Cash path you control.",
            },
            {
              icon: ListChecks,
              t: "Ranked moves + Ziki",
              d: "Stop asking ‘what now?’ Ziki and Moves rank the next high-impact step — share the gate, open the room, drop the tip — so dopamine meets a plan.",
            },
          ].map((f, i) => (
            <FadeUp key={f.t} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omniv-gold/15">
                  <f.icon className="h-5 w-5 text-omniv-gold" />
                </div>
                <p className="mt-4 text-[15px] font-semibold">{f.t}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{f.d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Wallet,
              t: "Tips + money",
              d: "Support lives on your page. Fans tip. Rooms sell. Payouts toward your bank. Streams stay a vanity metric — this is cash you can feel.",
            },
            {
              icon: Radio,
              t: "Agent + catalogue",
              d: "Outside signals (sync, playlists, labels) filtered for music — plus catalogue so a drop can actually connect to the money stack.",
            },
          ].map((f, i) => (
            <FadeUp key={f.t} delay={0.1 + i * 0.05}>
              <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
                  <f.icon className="h-5 w-5 text-omniv-gold" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">{f.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{f.d}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-8 md:px-8">
        <FadeUp>
          <div className="rounded-2xl border border-omniv-gold/20 bg-omniv-gold/5 px-5 py-5 text-center">
            <p className="text-[13px] leading-relaxed text-zinc-300 md:text-[14px]">
              <span className="font-semibold text-omniv-gold">Own the list.</span>{" "}
              <span className="text-zinc-400">Open the room.</span>{" "}
              <span className="font-semibold text-omniv-gold">Get paid.</span>{" "}
              <span className="text-zinc-400">Own the list.</span>{" "}
              <span className="font-semibold text-omniv-gold">Open the room.</span>{" "}
              <span className="text-zinc-400">Get paid.</span>
            </p>
            <p className="mt-2 text-[12px] text-zinc-600">
              Bio page · fan gate · rooms · tips · ranked moves — the loop independents never got.
            </p>
          </div>
        </FadeUp>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">How to start</p>
          <h2 className="mx-auto mt-2 max-w-xl text-center text-2xl font-semibold tracking-tight md:text-3xl">Three beats. Then the loop runs.</h2>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Launch your page",
              d: "Sign up. Put your story and song on one URL. That link becomes the bio — list + tip included.",
              icon: Music2,
            },
            {
              n: "2",
              t: "Capture demand",
              d: "Fans join with email + city + would-attend. Suddenly you know who would show up — not who scrolled past.",
              icon: Sparkles,
            },
            {
              n: "3",
              t: "Open room · collect tip",
              d: "When a city lights up, open a room. Tip stays on the same page. Come back for the next ranked move.",
              icon: ListChecks,
            },
          ].map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-omniv-gold/15 text-sm font-bold text-omniv-gold">{s.n}</span>
                  <s.icon className="h-4 w-4 text-omniv-gold" />
                </div>
                <p className="mt-4 text-[15px] font-semibold">{s.t}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{s.d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 text-center md:px-8">
        <FadeUp>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Stop hoping the algorithm pays you.
            <br />
            <span className="text-omniv-gold">Start owning the demand.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-500">
            Free to start. One page. A list you own. Rooms and tips when you&apos;re ready.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button className="h-12 rounded-full bg-omniv-gold px-10 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
              Own the list — start free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-[12px] text-zinc-600">
            Own the list. Open the room. Get paid.
          </p>
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
                Career OS for independents: artist page, fan gate, rooms, tips, ranked moves. Own the list. Open the room. Get paid.
              </p>
              <p className="mt-4 text-[12px] text-zinc-600">omniv.media</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Product</p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li><a href="#ecosystem" className="hover:text-zinc-200">Features</a></li>
                <li><a href="#how" className="hover:text-zinc-200">How it works</a></li>
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
          <div className="mt-12 border-t border-white/5 pt-6 text-[12px] text-zinc-600">
            © {year} Omniv. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
