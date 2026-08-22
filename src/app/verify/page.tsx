"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const CTA_HREF = "/signup?from=verify";
const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function CtaButton({ className }: { className?: string }) {
  return (
    <Link href={CTA_HREF} className={className}>
      <Button className="h-12 rounded-full bg-omniv-gold px-8 text-[15px] font-semibold text-black shadow-[0_0_32px_-6px_rgba(212,175,55,0.55)] transition hover:bg-omniv-gold/90 hover:shadow-[0_0_40px_-4px_rgba(212,175,55,0.7)]">
        Verify My Market
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </Link>
  );
}

const CITIES = [
  { city: "Lagos", interested: 34, attend: 18, pct: 42 },
  { city: "Accra", interested: 81, attend: 47, pct: 100, highlight: true },
  { city: "Abuja", interested: 12, attend: 6, pct: 15 },
];

export default function VerifyLandingPage() {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      {/* sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-semibold tracking-tight">Omniv</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="h-9 text-zinc-300">
                Log in
              </Button>
            </Link>
            <Link href={CTA_HREF}>
              <Button className="h-9 rounded-full px-4 text-[13px]">
                Verify My Market
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-14 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-omniv-gold/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <FadeUp>
            <p className="font-data text-[11px] uppercase tracking-[0.2em] text-omniv-gold">
              For independent artists
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
              Would your fans actually show up?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-zinc-300">
              You might have streams in Lagos, followers in Accra, and listeners
              everywhere. That doesn't tell you where you have a real market.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-zinc-300">
              Omniv helps you collect the signal that does: who's interested,
              where they're from, and who would actually attend.
            </p>
            <div className="mt-9">
              <CtaButton />
              <p className="mt-3 text-[13px] text-zinc-400">
                Free. Takes a few minutes to set up.
              </p>
              <p className="mt-1.5 text-[12px] text-zinc-500">
                No ads. No guessing. No &ldquo;post more.&rdquo;
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 2 — Problem */}
      <section className="border-y border-white/8 bg-[#0c0c0c] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Streams don't RSVP.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-zinc-300">
              You can have 20,000 streams. 8,000 followers. 500 likes. And still
              have no idea if you can fill a room in Lagos.
            </p>
            <p className="mt-2 text-[16px] text-zinc-400">
              Attention isn't the same thing as demand.
            </p>
          </FadeUp>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            <FadeUp delay={0.08}>
              <div className="h-full rounded-2xl border border-white/10 bg-black/50 p-5 transition hover:border-white/20">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  What you see
                </p>
                <ul className="mt-3 space-y-2.5 text-[15px] text-zinc-200">
                  <li>streams</li>
                  <li>followers</li>
                  <li>likes</li>
                  <li>views</li>
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.16}>
              <div className="h-full rounded-2xl border border-omniv-gold/40 bg-omniv-gold/[0.08] p-5 shadow-[0_0_40px_-12px_rgba(212,175,55,0.35)] transition hover:border-omniv-gold/60">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-omniv-gold">
                  What you need to know
                </p>
                <ul className="mt-3 space-y-2.5 text-[15px] text-zinc-100">
                  <li>who actually cares</li>
                  <li>where they are</li>
                  <li>who would attend</li>
                  <li>how many you can bring into a room</li>
                </ul>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            <p className="mt-9 text-lg font-semibold text-omniv-gold">
              Omniv measures the second column.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* 3 — Interactive demand map */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <FadeUp>
          <p className="text-center text-[11px] uppercase tracking-[0.16em] text-zinc-400">
            Example result · not live data
          </p>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight text-white">
            You think Lagos is your market.
          </h2>
          <p className="mt-2 text-center text-[16px] text-zinc-300">
            Your audience might disagree.
          </p>
        </FadeUp>

        <div className="mt-8 space-y-3">
          {CITIES.map((row, i) => (
            <FadeUp key={row.city} delay={0.06 * i}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-2xl border px-4 py-4 transition ${
                  row.highlight
                    ? "border-omniv-gold/50 bg-omniv-gold/10 shadow-[0_0_28px_-8px_rgba(212,175,55,0.4)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[16px] font-semibold text-white">
                    {row.city}
                    {row.highlight && (
                      <span className="ml-2 rounded-full bg-omniv-gold/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-omniv-gold">
                        strongest
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] text-zinc-300">
                    {row.interested} interested · {row.attend} would attend
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${
                      row.highlight ? "bg-omniv-gold" : "bg-zinc-500"
                    }`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.08 }}
                  />
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.2}>
          <div className="mt-8 rounded-2xl border border-omniv-gold/45 bg-gradient-to-b from-omniv-gold/15 to-transparent p-6 text-center">
            <p className="text-[11px] uppercase tracking-wider text-omniv-gold">
              Strongest verified demand
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">Accra</p>
            <p className="mt-1 text-[15px] text-zinc-300">
              Suggested first room: 40–60 people
            </p>
          </div>
          <p className="mt-6 text-center text-[16px] text-zinc-300">
            Maybe your gut was right. Maybe it wasn't.{" "}
            <span className="font-medium text-white">Now you have evidence.</span>
          </p>
        </FadeUp>
      </section>

      {/* 4 — Steps */}
      <section className="border-y border-white/8 bg-[#0c0c0c] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <h2 className="text-center text-3xl font-semibold tracking-tight text-white">
              Three steps. That's it.
            </h2>
          </FadeUp>
          <div className="mt-10 space-y-6">
            {[
              {
                n: "01",
                t: "Build your Fan Gate",
                d: "Create your free Omniv demand page. Fans enter email + city + whether they'd attend.",
              },
              {
                n: "02",
                t: "Share it",
                d: "Put the link where fans already are — Instagram, WhatsApp, TikTok, X, bio, next release. Your existing audience becomes the test.",
              },
              {
                n: "03",
                t: "See where the demand is",
                d: "Omniv turns responses into a market read: cities, interest, who would attend, room size that makes sense — then ranks what to test next.",
              },
            ].map((s, i) => (
              <FadeUp key={s.n} delay={0.08 * i}>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:border-omniv-gold/30 hover:bg-black/60">
                  <span className="font-data text-sm font-semibold text-omniv-gold">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-[16px] font-semibold text-white">{s.t}</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-300">
                      {s.d}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Promise */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <FadeUp>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            We don't just tell you where your listeners are.
          </h2>
          <p className="mt-4 text-xl font-semibold text-omniv-gold">
            We help you find out where they'll actually do something.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-zinc-300">
            Spotify can tell you where people listened. Instagram who followed.
            TikTok who watched. Those numbers don't answer:{" "}
            <span className="font-medium text-white">
              &ldquo;If I open a room here, will anyone come?&rdquo;
            </span>
          </p>
          <p className="mt-3 text-[16px] text-zinc-400">
            That's the question Omniv is built around.
          </p>
        </FadeUp>
      </section>

      {/* 6 — Don't / Do */}
      <section className="border-y border-white/8 bg-[#0c0c0c] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Verify first. Spend second.
            </h2>
          </FadeUp>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <FadeUp delay={0.08}>
              <div className="h-full rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                  Don't
                </p>
                <ul className="mt-3 space-y-2.5 text-[15px] text-zinc-200">
                  <li>book the 300-cap venue</li>
                  <li>print 500 flyers</li>
                  <li>run ₦100k in ads</li>
                  <li>pray</li>
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.16}>
              <div className="h-full rounded-2xl border border-omniv-gold/40 bg-omniv-gold/[0.08] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-omniv-gold">
                  Do
                </p>
                <ul className="mt-3 space-y-2.5 text-[15px] text-zinc-100">
                  <li>collect demand</li>
                  <li>see the city</li>
                  <li>estimate the room</li>
                  <li>test the market — then spend</li>
                </ul>
              </div>
            </FadeUp>
          </div>
          <FadeUp delay={0.2}>
            <p className="mt-8 text-lg font-semibold text-zinc-200">
              Don't pay to discover your market.
              <br />
              <span className="text-omniv-gold">
                Use the audience you already have to test it first.
              </span>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* 7 — Room */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <FadeUp>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Your demand should tell you how big to go.
          </h2>
          <div className="mt-8 rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-left">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">
              Example
            </p>
            <p className="mt-2 text-[15px] text-zinc-300">
              63 interested · 41 say they'd attend
            </p>
            <p className="mt-4 text-2xl font-semibold text-omniv-gold">
              Recommended room: 40–60 people
            </p>
            <p className="mt-1 text-[13px] text-zinc-400">Confidence: High</p>
          </div>
          <p className="mx-auto mt-6 max-w-md text-[16px] text-zinc-300">
            Don't book a 300-cap room because it looks good on the flyer. Book
            the room your market can actually fill.
          </p>
        </FadeUp>
      </section>

      {/* 8 — What you get */}
      <section className="border-y border-white/8 bg-[#0c0c0c] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <h2 className="text-center text-3xl font-semibold tracking-tight text-white">
              Your market, without the guesswork.
            </h2>
          </FadeUp>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              {
                t: "Demand map",
                d: "See which cities show the strongest demand.",
              },
              {
                t: "Audience signals",
                d: "See who's actually raising their hand.",
              },
              {
                t: "Attendance intent",
                d: 'Separate "I like your music" from "I\'d actually come."',
              },
              {
                t: "Room guidance",
                d: "A realistic starting point for your next event.",
              },
              {
                t: "Next move",
                d: "Turn what just happened into the next decision.",
              },
            ].map((item, i) => (
              <FadeUp key={item.t} delay={0.05 * i}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="h-full rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-omniv-gold/35"
                >
                  <p className="font-semibold text-omniv-gold">{item.t}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-300">
                    {item.d}
                  </p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Objection */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <FadeUp>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            &ldquo;But I already know where my fans are.&rdquo;
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-zinc-300">
            Maybe. But do you know who would attend? How many? Which city has the
            strongest intent? What size room they could fill? Whether that demand
            is stronger than another city?
          </p>
          <p className="mt-4 text-[16px] font-medium text-white">
            That's the difference between knowing your audience… and verifying
            your market.
          </p>
        </FadeUp>
      </section>

      {/* 10 — CTA */}
      <section className="border-y border-white/8 bg-[#0c0c0c] px-4 py-16 text-center">
        <FadeUp>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Find out where your music has real demand.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[16px] text-zinc-300">
            Set up your free Omniv demand page. Share it with your audience. Let
            the market answer.
          </p>
          <div className="mt-8">
            <CtaButton />
            <p className="mt-3 text-[13px] text-zinc-400">
              Free to start. No credit card required.
            </p>
          </div>
        </FadeUp>
      </section>

      {/* 11 — Final */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <FadeUp>
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your gut can pick the city.
            <br />
            <span className="text-omniv-gold">
              Your fans should get the final vote.
            </span>
          </p>
          <p className="mt-8 font-data text-[12px] uppercase tracking-[0.2em] text-zinc-400">
            Omniv · Verify demand. Then spend.
          </p>
          <div className="mt-8">
            <CtaButton />
          </div>
        </FadeUp>
      </section>

      {/* mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050505]/95 p-3 backdrop-blur-md sm:hidden">
        <Link href={CTA_HREF} className="block">
          <Button className="h-12 w-full rounded-full bg-omniv-gold text-[15px] font-semibold text-black">
            Verify My Market
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="h-16 sm:hidden" />

      <SiteFooter />
    </div>
  );
}
