"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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

  const briefs = [
    "Lagos: 80 fans, 15% intent-to-attend, optimal ticket $5, recommended venue: 50-cap coffee shop.",
    "Accra: 42 fans, 22% intent-to-attend, optimal ticket $5, recommended venue: 30-cap living-room.",
    "London: 120 fans, 9% intent-to-attend, optimal ticket $8, recommended venue: 80-cap bar.",
  ];

  const pillars = [
    {
      t: "Show-up math",
      d: "Not follower counts. Fans × would-attend → ticket price → room size. One sentence you can act on.",
      img: "/landing/show-up.png",
    },
    {
      t: "Outside intelligence",
      d: "Labels, sync, playlists, trending angles in your genre. Agent brings the market. Moves executes.",
      img: "/landing/agent.png",
    },
    {
      t: "First cash without a label",
      d: "Rooms, tips, tickets. Own the list. Pay out to your bank. Career OS, not another moodboard.",
      img: "/landing/cash.png",
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050505] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.16),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,80,255,0.08),transparent_40%)]" />

      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
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
                Free scan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-10 md:px-8 md:pt-16">
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
            <Sparkles className="h-3 w-3" />
            Career intelligence for independents
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="mt-6 text-[2.15rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
          >
            Know who shows up.
            <br />
            <span className="bg-gradient-to-r from-omniv-gold via-amber-200 to-omniv-gold bg-clip-text text-transparent">
              Open the room. Get paid.
            </span>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400 md:text-base"
          >
            Omniv turns fan city + intent into a one-line brief: how many would
            attend, what to charge, what size venue. Then Agent surfaces outside
            deals while you execute.
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

        <FadeUp delay={0.15}>
          <div className="relative mx-auto mt-14 max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-1 shadow-2xl shadow-black/50">
            <div className="rounded-[1.35rem] bg-[#0a0a0a] p-5 md:p-7">
              <p className="font-data text-[10px] uppercase tracking-[0.2em] text-omniv-gold">
                Live demand brief
              </p>
              <ul className="mt-4 space-y-3">
                {briefs.map((line) => (
                  <li
                    key={line}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-[13px] leading-snug text-zinc-200 md:text-[14px]"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] text-zinc-500">
                Built from owned Fan Gate data — email, city, would attend —
                not rented followers.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8">
        <FadeUp>
          <p className="text-center font-data text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            The product
          </p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Intelligence you can execute the same day
          </h2>
        </FadeUp>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <FadeUp key={p.t} delay={i * 0.06}>
              <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-violet-500/20 via-omniv-gold/10 to-transparent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt=""
                    className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-semibold">{p.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                    {p.d}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
          <FadeUp>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Before Omniv
            </p>
            <p className="mt-3 text-xl font-medium leading-snug text-zinc-400">
              “I don’t know what to do this week.”
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-omniv-gold">
              After Omniv
            </p>
            <p className="mt-3 text-xl font-medium leading-snug text-zinc-100">
              “Open room in Accra · $5 · 30-cap. Pitch the sync brief. Drop
              Friday.”
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
        <FadeUp>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your turn.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-zinc-400">
            Scan once. See ranked cities, intent, and the move that pays first.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button className="h-12 rounded-full bg-omniv-gold px-10 text-[15px] font-semibold text-black">
              Start free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </FadeUp>
      </section>

      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-[12px] text-zinc-500 md:px-8">
          <span>© {new Date().getFullYear()} Omniv</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300">
              Terms
            </Link>
            <Link href="/blog" className="hover:text-zinc-300">
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
