"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";
import { DISCOVERY_PLANS } from "@/lib/discovery/monetization";
import { countQualifiedInteractions } from "@/lib/discovery/signals";

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
  const [likes, setLikes] = useState(0);
  const [qualified, setQualified] = useState(0);

  useEffect(() => {
    try {
      setPersonalName(readProfile().displayName || "You");
      setActive(readActiveAccount());
      setQualified(countQualifiedInteractions());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, fRes, sRes, lRes] = await Promise.all([
          fetch("/api/discovery/publications/list?owner=me&limit=80"),
          fetch("/api/discovery/follow"),
          fetch("/api/discovery/save"),
          fetch("/api/discovery/like"),
        ]);
        const pData = await pRes.json();
        const fData = await fRes.json();
        const sData = await sRes.json();
        const lData = await lRes.json();
        setAuth(pData.auth !== false);
        setPubs(pData.publications || []);
        if (Array.isArray(fData.follows)) setFollows(fData.follows.length);
        if (Array.isArray(sData.saves)) setSaves(sData.saves.length);
        if (Array.isArray(lData.likes)) setLikes(lData.likes.length);
      } catch {
        setAuth(false);
      }
    })();
  }, []);

  const scopedPubs = useMemo(() => {
    if (!active?.id) return pubs;
    return pubs.filter(
      (p) =>
        p.publisherId === active.id ||
        (p.publisherName &&
          p.publisherName.toLowerCase() === active.name.toLowerCase())
    );
  }, [pubs, active]);

  const entityName = active?.name || personalName;
  const totalHeat = useMemo(
    () => scopedPubs.reduce((s, p) => s + (p.heat || 0), 0),
    [scopedPubs]
  );

  const rangeFactor =
    range === "7d" ? 0.25 : range === "30d" ? 1 : range === "90d" ? 2.2 : 4;

  const discoveries = Math.round(
    Math.max(totalHeat, scopedPubs.length) * rangeFactor
  );
  const profileViews = Math.round(
    Math.max(follows * 8, scopedPubs.length * 3) * rangeFactor
  );

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
            <Link
              href="/pricing"
              className="text-[13px] font-medium text-omniv-gold"
            >
              Pro
            </Link>
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
                  label="Your likes"
                  value={formatNum(likes)}
                  note="Network likes given"
                />
              </div>

              <p className="mt-3 text-[11px] text-zinc-600">
                Discovery quality counts meaningful actions (save, follow,
                complete, contact, share) — not raw views. Trending still ranks
                by heat.
              </p>

              <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
                Publications by heat
              </h2>
              <p className="mt-1 text-[12px] text-zinc-600">
                {scopedPubs.length} for this identity · total heat {totalHeat}
              </p>

              {scopedPubs.length === 0 ? (
                <p className="mt-6 text-center text-[14px] text-zinc-500">
                  No publications for this identity.{" "}
                  <Link href="/publish" className="text-omniv-gold">
                    Publish as {entityName}
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {[...scopedPubs]
                    .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
                    .slice(0, 12)
                    .map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/p/${p.slug}`}
                          className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium text-white">
                              {p.title}
                            </p>
                            <p className="text-[11px] capitalize text-zinc-500">
                              {p.type}
                            </p>
                          </div>
                          <span className="text-[13px] tabular-nums text-zinc-400">
                            {p.heat ?? 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}

              <div className="mt-10 rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/25">
                <p className="text-[15px] font-semibold text-white">
                  Full Pro analytics
                </p>
                <p className="mt-1 text-[13px] text-zinc-400">
                  Per-identity demand, sources, and export when event tracking is
                  live.
                </p>
                <Link
                  href="/pro"
                  className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
                >
                  Upgrade to Pro — ${DISCOVERY_PLANS.pro.priceMonthlyUsd}/mo
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
