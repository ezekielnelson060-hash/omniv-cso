"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";

const CTA_HREF = "/signup?from=verify";

function CtaButton({ className }: { className?: string }) {
  return (
    <Link href={CTA_HREF} className={className}>
      <Button className="h-12 rounded-full bg-omniv-gold px-8 text-[15px] font-semibold text-black hover:bg-omniv-gold/90">
        Verify My Market
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </Link>
  );
}

export default function VerifyLandingPage() {
  return (
    <div className="min-h-dvh bg-omniv-black text-omniv-text">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
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
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="outline" className="h-9">
              Log in
            </Button>
          </Link>
          <Link href={CTA_HREF}>
            <Button className="h-9">Verify My Market</Button>
          </Link>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-10 text-center">
        <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
          For independent artists
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Would your fans actually show up?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary">
          You might have streams in Lagos, followers in Accra, and listeners
          everywhere. That doesn't tell you where you have a real market.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary">
          Omniv helps you collect the signal that does: who's interested,
          where they're from, and who would actually attend.
        </p>
        <div className="mt-8">
          <CtaButton />
          <p className="mt-3 text-[12px] text-zinc-500">
            Free. Takes a few minutes to set up.
          </p>
          <p className="mt-2 text-[12px] text-zinc-600">
            No ads. No guessing. No &ldquo;post more.&rdquo;
          </p>
        </div>
      </section>

      {/* 2 — Problem */}
      <section className="border-y border-white/5 bg-[#0a0a0a] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Streams don't RSVP.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-omniv-text-secondary">
            You can have 20,000 streams. 8,000 followers. 500 likes. And still
            have no idea if you can fill a room in Lagos.
          </p>
          <p className="mt-2 text-[15px] text-omniv-text-secondary">
            Attention isn't the same thing as demand.
          </p>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                What you see
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-zinc-400">
                <li>streams</li>
                <li>followers</li>
                <li>likes</li>
                <li>views</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-omniv-gold">
                What you need to know
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-omniv-text">
                <li>who actually cares</li>
                <li>where they are</li>
                <li>who would attend</li>
                <li>how many you can bring into a room</li>
              </ul>
            </div>
          </div>

          <p className="mt-8 text-lg font-semibold text-omniv-gold">
            Omniv measures the second column.
          </p>
        </div>
      </section>

      {/* 3 — Example demand map */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          Example result · not live data
        </p>
        <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight">
          You think Lagos is your market.
        </h2>
        <p className="mt-2 text-center text-[15px] text-omniv-text-secondary">
          Your audience might disagree.
        </p>

        <div className="mt-8 space-y-3">
          {[
            { city: "Lagos", interested: 34, attend: 18 },
            { city: "Accra", interested: 81, attend: 47, highlight: true },
            { city: "Abuja", interested: 12, attend: 6 },
          ].map((row) => (
            <div
              key={row.city}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                row.highlight
                  ? "border-omniv-gold/40 bg-omniv-gold/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <span className="font-semibold">{row.city}</span>
              <span className="text-[13px] text-zinc-400">
                {row.interested} interested · {row.attend} would attend
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-omniv-gold/40 bg-omniv-gold/10 p-6 text-center">
          <p className="text-[11px] uppercase tracking-wider text-omniv-gold">
            Strongest verified demand
          </p>
          <p className="mt-2 text-3xl font-semibold">Accra</p>
          <p className="mt-1 text-[14px] text-omniv-text-secondary">
            Suggested first room: 40–60 people
          </p>
        </div>

        <p className="mt-6 text-center text-[15px] text-omniv-text-secondary">
          Maybe your gut was right. Maybe it wasn't.{" "}
          <span className="text-omniv-text">Now you have evidence.</span>
        </p>
      </section>

      {/* 4 — How it works */}
      <section className="border-y border-white/5 bg-[#0a0a0a] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Three steps. That's it.
          </h2>
          <div className="mt-10 space-y-8">
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
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="font-data text-sm text-omniv-gold">{s.n}</span>
                <div>
                  <p className="font-semibold">{s.t}</p>
                  <p
                    className="mt-1 text-[14px] leading-relaxed text-omniv-text-secondary"
                    dangerouslySetInnerHTML={{ __html: s.d }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Promise vs Spotify */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          We don't just tell you where your listeners are.
        </h2>
        <p className="mt-4 text-xl font-semibold text-omniv-gold">
          We help you find out where they'll actually do something.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary">
          Spotify can tell you where people listened. Instagram who followed.
          TikTok who watched. Those numbers don't answer:{" "}
          <span className="text-omniv-text">
            &ldquo;If I open a room here, will anyone come?&rdquo;
          </span>
        </p>
        <p className="mt-3 text-[15px] text-omniv-text-secondary">
          That's the question Omniv is built around.
        </p>
      </section>

      {/* 6 — Money */}
      <section className="border-y border-white/5 bg-[#0a0a0a] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Verify first. Spend second.
          </h2>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400/80">
                Don't
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-zinc-400">
                <li>book the 300-cap venue</li>
                <li>print 500 flyers</li>
                <li>run ₦100k in ads</li>
                <li>pray</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-omniv-gold">
                Do
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-omniv-text">
                <li>collect demand</li>
                <li>see the city</li>
                <li>estimate the room</li>
                <li>test the market — then spend</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 text-lg font-semibold">
            Don't pay to discover your market.
            <br />
            <span className="text-omniv-gold">
              Use the audience you already have to test it first.
            </span>
          </p>
        </div>
      </section>

      {/* 7 — Room size */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Your demand should tell you how big to go.
        </h2>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">
            Example
          </p>
          <p className="mt-2 text-[15px] text-omniv-text-secondary">
            63 interested · 41 say they'd attend
          </p>
          <p className="mt-4 text-2xl font-semibold text-omniv-gold">
            Recommended room: 40–60 people
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">Confidence: High</p>
        </div>
        <p className="mx-auto mt-6 max-w-md text-[15px] text-omniv-text-secondary">
          Don't book a 300-cap room because it looks good on the flyer. Book
          the room your market can actually fill.
        </p>
      </section>

      {/* 8 — What you get */}
      <section className="border-y border-white/5 bg-[#0a0a0a] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Your market, without the guesswork.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
            ].map((item) => (
              <div
                key={item.t}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <p className="font-semibold text-omniv-gold">{item.t}</p>
                <p className="mt-1 text-[13px] text-omniv-text-secondary">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Objection */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          &ldquo;But I already know where my fans are.&rdquo;
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] text-omniv-text-secondary">
          Maybe. But do you know who would attend? How many? Which city has the
          strongest intent? What size room they could fill? Whether that demand
          is stronger than another city?
        </p>
        <p className="mt-4 text-[15px] font-medium">
          That's the difference between knowing your audience… and verifying
          your market.
        </p>
      </section>

      {/* 10 — CTA */}
      <section className="border-y border-white/5 bg-[#0a0a0a] px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Find out where your music has real demand.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-omniv-text-secondary">
          Set up your free Omniv demand page. Share it with your audience. Let
          the market answer.
        </p>
        <div className="mt-8">
          <CtaButton />
          <p className="mt-3 text-[12px] text-zinc-500">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* 11 — Final punch */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your gut can pick the city.
          <br />
          <span className="text-omniv-gold">
            Your fans should get the final vote.
          </span>
        </p>
        <p className="mt-8 font-data text-[12px] uppercase tracking-[0.2em] text-zinc-500">
          Omniv · Verify demand. Then spend.
        </p>
        <div className="mt-8">
          <CtaButton />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
