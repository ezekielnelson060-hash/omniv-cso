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
  MapPin,
  FileText,
  Library,
  Shield,
  Building2,
  MessageSquare,
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
            <a href="#stack" className="hover:text-white">Full stack</a>
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
            Career OS — not another dashboard you ignore
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
            <span className="text-zinc-200">Omniv is the whole loop</span> — artist page, fan gate, city demand, rooms, tips, CRM, ranked moves, Ziki, catalogue, contracts, royalties checklist, payouts. Demand in. Cash out. Next move ranked.
          </motion.p>
          <motion.div variants={heroItem} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button className="h-12 rounded-full bg-omniv-gold px-8 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
                Claim your artist page free
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <a href="#stack" className="text-[14px] font-medium text-zinc-400 underline-offset-4 hover:text-omniv-gold hover:underline">
              See everything inside →
            </a>
          </motion.div>
          <motion.p variants={heroItem} className="mt-5 text-[12px] text-zinc-600">
            Own the list. Open the room. Get paid. Build the catalogue. Ask Ziki. Repeat.
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
                  <span className="text-omniv-gold">1.</span> Bio page live — song, story, fan gate, tip, links
                </li>
                <li className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <span className="text-omniv-gold">2.</span> Map lights up: city · intent · ticket idea · room size
                </li>
                <li className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <span className="text-omniv-gold">3.</span> Open room · collect tips · ranked next move waiting
                </li>
              </ul>
              <p className="mt-4 text-left text-[12px] text-zinc-600">
                Fans × intent → ticket × room. Then catalogue, contracts, and royalty paths when you&apos;re ready to scale.
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
            Tools you already know — bio, tips, tickets, CRM — finally wired into one career OS.
          </p>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <FadeUp>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Without Omniv</p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-zinc-400">
                <li>Bio is five dead links. List lives on Instagram.</li>
                <li>Streams look loud. The room stays empty.</li>
                <li>Tips, tickets, contracts, royalties — five tabs, zero plan.</li>
                <li>You still don&apos;t know <span className="text-zinc-300">who would show up</span>.</li>
              </ul>
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="h-full rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">With Omniv</p>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-zinc-200">
                <li>One page: story · song · list · tip · links.</li>
                <li>CRM, maps, rooms, payouts — demand becomes money.</li>
                <li>Ziki + ranked moves so “what now?” has an answer.</li>
                <li>Catalogue, contracts, royalty checklist when you scale.</li>
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      <section id="ecosystem" className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">Core engines</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Own the list. Open the room. Get paid. Repeat.
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              t: "Artist page + fan gate",
              d: "One bio URL: story, release, stream/download, email + city + would-attend, links, tips. Not Linktree — a page that captures demand you own.",
            },
            {
              icon: CalendarRange,
              t: "Rooms + live gatherings",
              d: "When a city lights up, open a ticketed room. Share the link. Seat people who already said yes. Live room page for the night.",
            },
            {
              icon: ListChecks,
              t: "Ranked moves + Ziki",
              d: "AI career partner. Ranked next steps — share the gate, open the room, drop the tip, pitch — so dopamine meets a plan, not a blank feed.",
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
      </section>

      {/* Full stack — every surface */}
      <section id="stack" className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">The full stack</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Endless surface. One operating system.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[14px] text-zinc-500">
            Audience → demand → money → strategy → scale. Everything independents were forced to duct-tape alone.
          </p>
        </FadeUp>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Users,
              t: "Artist page",
              d: "Story top / middle / bottom. Track. Links with real labels. Tip module. One shareable URL for Instagram and TikTok.",
            },
            {
              icon: Sparkles,
              t: "Fan gate",
              d: "Email + city + would-attend. Consent. Source tracking. Turns scrollers into a list platforms can’t revoke.",
            },
            {
              icon: ListChecks,
              t: "Fan CRM",
              d: "Directory, tiers (superfan / cold), sources, export. Treat fans like a business — not a vanity count.",
            },
            {
              icon: MapPin,
              t: "City demand maps",
              d: "Heat map + audience map. See where people said they’d come. Stop guessing tours. Open where demand already is.",
            },
            {
              icon: CalendarRange,
              t: "Rooms",
              d: "Create a gathering, set city and venue, share a ticketed link. Live room surface for the night.",
            },
            {
              icon: Wallet,
              t: "Tips + earnings",
              d: "Tips on the artist page. Checkout. Earnings tab. Payouts toward your bank when linked.",
            },
            {
              icon: Building2,
              t: "Roster + label payouts",
              d: "Multi-artist roster. Stage names. Split payouts for managers and labels who run more than one act.",
            },
            {
              icon: MessageSquare,
              t: "Ziki AI",
              d: "Chat strategist. Ask what to do next. Attach context. Get moves grounded in your data — not generic hustle quotes.",
            },
            {
              icon: ListChecks,
              t: "Ranked moves",
              d: "Home and Moves surfaces rank high-impact tasks. Execute one. Come back for the next. No more blank “content calendar.”",
            },
            {
              icon: Radio,
              t: "Agent signals",
              d: "Outside market noise filtered for music — labels, sync, playlists — with a path to the source.",
            },
            {
              icon: Library,
              t: "Catalogue",
              d: "Releases and tracks in one place so drops connect to the money stack — not a folder on your desktop.",
            },
            {
              icon: FileText,
              t: "Contracts",
              d: "Contract panel for the deals that actually matter when money starts moving.",
            },
            {
              icon: Wallet,
              t: "Royalty checklist",
              d: "SoundExchange, MLC, PROs, Songtrust and more — money platforms already may owe you. Omniv points; you claim.",
            },
            {
              icon: Shield,
              t: "Plans + security",
              d: "Free to start. Higher tiers for heavier usage. 2FA path for accounts that move money. Settings that stay yours.",
            },
            {
              icon: Music2,
              t: "Share + SEO",
              d: "Copy link, share, preview. Public pages built to be found. Blog and audit flows for the long game.",
            },
          ].map((f, i) => (
            <FadeUp key={f.t} delay={Math.min(i * 0.03, 0.3)}>
              <div className="flex h-full gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
                  <f.icon className="h-4 w-4 text-omniv-gold" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold">{f.t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{f.d}</p>
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
              <span className="text-zinc-400">Ask Ziki.</span>{" "}
              <span className="font-semibold text-omniv-gold">Rank the move.</span>{" "}
              <span className="text-zinc-400">Scale the catalogue.</span>
            </p>
            <p className="mt-2 text-[12px] text-zinc-600">
              Page · gate · CRM · maps · rooms · tips · Ziki · moves · agent · catalogue · contracts · royalties · payouts
            </p>
          </div>
        </FadeUp>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-5 py-14 md:px-8">
        <FadeUp>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">How to start</p>
          <h2 className="mx-auto mt-2 max-w-xl text-center text-2xl font-semibold tracking-tight md:text-3xl">Three beats. Then the whole stack opens.</h2>
        </FadeUp>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Launch your page",
              d: "Sign up. Story + song on one URL. Fan gate and tip included. That link is your new bio.",
              icon: Music2,
            },
            {
              n: "2",
              t: "Capture demand",
              d: "Fans join with email + city + would-attend. CRM and maps fill. You finally see who would show up.",
              icon: Sparkles,
            },
            {
              n: "3",
              t: "Execute the stack",
              d: "Open a room. Collect tips. Ask Ziki. Hit the ranked move. Grow catalogue and claim royalties as you scale.",
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
            <span className="text-omniv-gold">Run the OS that pays attention to demand.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
            Free to start. Artist page, fan gate, CRM, maps, rooms, tips, Ziki, moves — and room to grow into catalogue, contracts, and royalties.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button className="h-12 rounded-full bg-omniv-gold px-10 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
              Own the list — start free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-[12px] text-zinc-600">
            Own the list. Open the room. Get paid. Ask Ziki. Rank the move.
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
                Career OS for independents: artist page, fan gate, CRM, city maps, rooms, tips, Ziki, ranked moves, agent, catalogue, contracts, royalty checklist, payouts.
              </p>
              <p className="mt-4 text-[12px] text-zinc-600">omniv.media</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Product</p>
              <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
                <li><a href="#ecosystem" className="hover:text-zinc-200">Core engines</a></li>
                <li><a href="#stack" className="hover:text-zinc-200">Full stack</a></li>
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
