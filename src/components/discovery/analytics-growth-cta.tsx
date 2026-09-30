"use client";

import Link from "next/link";

/**
 * Shown on Analytics when the identity has momentum.
 * Promote · Invite · Audience — one place for growth actions.
 */
export function AnalyticsGrowthCta({
  show = true,
}: {
  show?: boolean;
}) {
  if (!show) return null;
  return (
    <section className="mt-6 rounded-2xl bg-omniv-gold/10 p-4 ring-1 ring-omniv-gold/25">
      <p className="text-[15px] font-semibold text-white">Why this is working</p>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
        Your publications are earning saves, follows, and qualified opens.
        Promote your strongest piece to reach people outside your current
        network — or invite those already interested.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/promote"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black"
        >
          <span aria-hidden>⚡</span>
          Promote
        </Link>
        <Link
          href="/invites"
          className="inline-flex h-10 items-center rounded-full bg-white/[0.08] px-4 text-[13px] font-medium text-white"
        >
          Invite to discover
        </Link>
        <Link
          href="/audience"
          className="inline-flex h-10 items-center rounded-full bg-white/[0.08] px-4 text-[13px] font-medium text-white"
        >
          Audience
        </Link>
      </div>
    </section>
  );
}
