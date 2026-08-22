"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

/** Marketing home — demand verification wedge. */
export default function HomePage() {
  return (
    <div className="min-h-dvh bg-omniv-black text-omniv-text">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-semibold tracking-tight">Omniv</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="outline" className="h-9">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="h-9">Start free</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 text-center">
        <p className="font-data text-[11px] uppercase tracking-[0.18em] text-omniv-gold">
          Artist market demand intelligence
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Stop guessing where your fans are.
          <span className="block text-omniv-gold">
            Verify demand. Then spend.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-omniv-text-secondary">
          Omniv captures city + intent on your Fan Gate, scores real market
          demand, and ranks the next move — open a room, get paid, ask Ziki
          (your visual Chief Strategic Officer trained on artist management).
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/verify">
            <Button className="h-11 px-6">Verify my market</Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" className="h-11 px-6">
              Read the playbooks
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {[
            {
              t: "Fan Gate",
              d: "Email, city, would attend — owned demand, not vanity followers.",
            },
            {
              t: "Regional score",
              d: "0–100 market demand by city. Room size and ticket suggestion.",
            },
            {
              t: "Ziki · Visual CSO",
              d: "Chief Strategic Officer trained on artist management. Demand first.",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-2xl border border-omniv-border bg-omniv-elevated/50 p-4"
            >
              <p className="text-sm font-semibold text-omniv-gold">{c.t}</p>
              <p className="mt-1 text-[13px] text-omniv-text-secondary">{c.d}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
