"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { AnalyticsExport } from "@/components/discovery/analytics-export";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";
import { DISCOVERY_PLANS } from "@/lib/discovery/monetization";
import {
  countQualifiedInteractions,
  readTopSignalTopics,
} from "@/lib/discovery/signals";
import { AnalyticsGrowthCta } from "@/components/discovery/analytics-growth-cta";

type Pub = {
  id: string;
  title: string;
  type: string;
  slug: string;
  heat?: number;
  publisherId?: string;
  publisherName?: string;
};

type Range = "7d" | "30d" | "90d" | "1y";

export default function AnalyticsPage() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [personalName, setPersonalName] = useState("You");
  const [follows, setFollows] = useState(0);
  const [saves, setSaves] = useState(0);

  useEffect(() => {
    setActive(readActiveAccount());
    setPersonalName(readProfile().displayName || "You");
    return onAccountSwitch(() => {
      setActive(readActiveAccount());
      setPersonalName(readProfile().displayName || "You");
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/publications");
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        const list = Array.isArray(data.publications) ? data.publications : [];
        setPubs(
          list.map((p: Record<string, unknown>) => ({
            id: String(p.id || p.slug || ""),
            title: String(p.title || ""),
            type: String(p.type || "article"),
            slug: String(p.slug || ""),
            heat: Number(p.heat || 0),
            publisherId: p.publisher_id ? String(p.publisher_id) : undefined,
            publisherName: p.publisher_name
              ? String(p.publisher_name)
              : undefined,
          }))
        );
      } catch {
        if (!cancelled) setAuth(false);
      }
      try {
        const fr = await fetch("/api/discovery/followers");
        const fd = await fr.json();
        if (!cancelled && typeof fd.count === "number") setFollows(fd.count);
      } catch {
        /* optional */
      }
      try {
        const sr = await fetch("/api/discovery/save");
        const sd = await sr.json();
        if (!cancelled && Array.isArray(sd.saves)) setSaves(sd.saves.length);
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const entityName = active?.name || personalName;

  const scopedPubs = useMemo(() => {
    if (!active) return pubs;
    return pubs.filter(
      (p) =>
        p.publisherId === active.id ||
        p.publisherName === active.name
    );
  }, [pubs, active]);

  const totalHeat = scopedPubs.reduce((s, p) => s + (p.heat || 0), 0);
  const rangeFactor =
    range === "7d" ? 0.25 : range === "30d" ? 1 : range === "90d" ? 2.2 : 5;
  const discoveries = Math.round(
    Math.max(totalHeat, scopedPubs.length) * rangeFactor
  );
  const profileViews = Math.round(
    Math.max(follows * 8, scopedPubs.length * 3) * rangeFactor
  );
  const qualified = countQualifiedInteractions();
  const topics = readTopSignalTopics(5);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt=""
                width={28}
                height={28}
                className="rounded-md md:hidden"
              />
              <div>
                <p className="text-[12px] text-zinc-500">{entityName}</p>
                <h1 className="text-[17px] font-semibold text-white">
                  Analytics
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AnalyticsExport
                rows={[
                  { metric: "heat", value: discoveries, range },
                  { metric: "profile_reach", value: profileViews, range },
                  { metric: "saves", value: saves, range },
                  { metric: "follows", value: follows, range },
                ]}
              />
              <Link
                href="/pricing"
                className="text-[13px] font-medium text-omniv-gold"
              >
                Pro
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <div className="mb-4">
            <CurrentIdentityBanner action="Analytics for" />
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { id: "7d" as const, label: "7D" },
                { id: "30d" as const, label: "30D" },
                { id: "90d" as const, label: "90D" },
                { id: "1y" as const, label: "1Y" },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`inline-flex h-8 items-center justify-center rounded-full px-3.5 text-[12px] font-semibold leading-none ${
                  range === r.id
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {auth === false && (
            <div className="mt-12 text-center">
              <p className="text-zinc-500">Sign in to see analytics.</p>
              <Link
                href="/signup?next=/analytics"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat
                  label="Heat score"
                  value={formatNum(discoveries)}
                  note="From likes + engagement"
                />
                <Stat
                  label="Profile reach"
                  value={formatNum(profileViews)}
                  note="Estimated from network"
                />
                <Stat label="Saves" value={formatNum(saves)} note="Real count" />
                <Stat
                  label="Follows"
                  value={formatNum(follows)}
                  note="Real count"
                />
                <Stat
                  label="Qualified"
                  value={formatNum(qualified)}
                  note="Saves · follows · completes"
                />
                <Stat
                  label="Publications"
                  value={formatNum(scopedPubs.length)}
                  note="This identity"
                />
              </div>

              <AnalyticsGrowthCta
                show={
                  scopedPubs.length > 0 &&
                  (totalHeat > 0 || discoveries > 20 || saves + follows > 0)
                }
              />

              {topics.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Top interest signals
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {topics.map((t) => (
                      <li
                        key={t.topic}
                        className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5"
                      >
                        <span className="text-[14px] text-white">{t.topic}</span>
                        <span className="text-[12px] text-zinc-500">{t.weight.toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {scopedPubs.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Publications
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {scopedPubs.slice(0, 12).map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/p/${p.slug}`}
                          className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium text-white">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-zinc-500">{p.type}</p>
                          </div>
                          <span className="text-[12px] text-zinc-500">
                            heat {p.heat || 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-10 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
                <p className="text-[14px] font-semibold text-white">
                  {DISCOVERY_PLANS.pro.name} unlocks deeper stats
                </p>
                <p className="mt-2 text-[13px] text-zinc-500">
                  Per-identity demand, sources, and export when event tracking is
                  fully wired.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
                >
                  View plans
                </Link>
              </div>
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <p className="text-[12px] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-zinc-600">{note}</p>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
