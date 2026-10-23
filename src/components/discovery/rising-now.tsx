"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RisingTopic } from "@/lib/discovery/rising-topics";
import {
  rankRisingTopics,
  shouldShowRising,
  humanizeTopic,
} from "@/lib/discovery/rising-topics";
import type { Publication } from "@/lib/discovery/types";
import { getRecentSignals } from "@/lib/discovery/signals";

type Props = {
  /** Fallback when API is slow/empty — scored client-side from feed pool */
  publications?: Publication[];
};

export function RisingNow({ publications = [] }: Props) {
  const [topics, setTopics] = useState<RisingTopic[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    function fromLocal(): RisingTopic[] {
      const momentum: Record<string, number> = {};
      const since = Date.now() - 72 * 3_600_000;
      for (const e of getRecentSignals(200)) {
        if (e.at < since) continue;
        if (e.kind === "skip") continue;
        const ageHours = Math.max(0, (Date.now() - e.at) / 3_600_000);
        const recency = Math.exp(-ageHours / 36);
        const base =
          e.kind === "save" || e.kind === "follow"
            ? 1.1
            : e.kind === "open" || e.kind === "complete"
              ? 0.45
              : 0.25;
        for (const t of e.tags || []) {
          const key = String(t).toLowerCase().trim();
          if (key.length < 3) continue;
          momentum[key] = (momentum[key] || 0) + base * recency;
        }
      }
      return rankRisingTopics(
        publications.map((p) => ({
          tags: p.tags,
          category: p.category,
          heat: p.heat,
          publishedAt: p.publishedAt,
        })),
        momentum,
        6
      );
    }

    async function load() {
      try {
        const res = await fetch("/api/discovery/rising", {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        const apiTopics = Array.isArray(data.topics)
          ? (data.topics as RisingTopic[])
          : [];
        if (apiTopics.length >= 2) {
          setTopics(apiTopics);
          return;
        }
      } catch {
        /* fall through */
      }
      if (cancelled) return;
      const local = fromLocal();
      setTopics(shouldShowRising(local) ? local : []);
    }

    void load();
    const id = window.setInterval(() => void load(), 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [publications]);

  if (topics === null) {
    return (
      <section aria-busy="true">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Rising now
        </p>
        <div className="mt-1 h-px w-full bg-white/[0.06]" />
        <ul className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-10 animate-pulse rounded-xl bg-white/[0.04]"
            />
          ))}
        </ul>
      </section>
    );
  }

  if (!topics.length) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Rising now
          </p>
          <p className="mt-1 text-[12px] text-zinc-600">
            Topics gaining attention on Omniv
          </p>
        </div>
        <Link
          href="/explore"
          className="shrink-0 text-[12px] font-medium text-omniv-gold"
        >
          Explore
        </Link>
      </div>
      <div className="mt-2 h-px w-full bg-white/[0.06]" />

      <ol className="mt-4 space-y-1">
        {topics.map((t, i) => (
          <li key={t.key}>
            <Link
              href={`/explore?interest=${encodeURIComponent(t.label)}`}
              className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.04]"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums ${
                  i === 0
                    ? "bg-omniv-gold text-black"
                    : i < 3
                      ? "bg-white/[0.08] text-white"
                      : "bg-transparent text-zinc-600"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-zinc-100 group-hover:text-white">
                  {t.label || humanizeTopic(t.key)}
                </span>
                <span className="mt-1 flex h-1 max-w-[140px] overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="h-full rounded-full bg-omniv-gold/70"
                    style={{
                      width: `${Math.round(t.momentum * 100)}%`,
                    }}
                  />
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-zinc-600 group-hover:text-zinc-400">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
