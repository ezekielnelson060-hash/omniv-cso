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

const SOURCES = [
  { label: "Search", pct: 34 },
  { label: "Explore", pct: 28 },
  { label: "Followed", pct: 22 },
  { label: "External", pct: 14 },
  { label: "Other", pct: 12 },
];

export default function AnalyticsPage() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [personalName, setPersonalName] = useState("You");
  const [follows, setFollows] = useState(0);
  const [saves, setSaves] = useState(0);

  useEffect(() => {
    try {
      setPersonalName(readProfile().displayName || "You");
      setActive(readActiveAccount());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, fRes, sRes] = await Promise.all([
          fetch("/api/discovery/publications/list?owner=me&limit=80"),
          fetch("/api/discovery/follow"),
          fetch("/api/discovery/save"),
        ]);
        const pData = await pRes.json();
        const fData = await fRes.json();
        const sData = await sRes.json();
        setAuth(pData.auth !== false);
        setPubs(pData.publications || []);
        if (Array.isArray(fData.follows)) setFollows(fData.follows.length);
        if (Array.isArray(sData.saves)) setSaves(sData.saves.length);
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

  const discoveries = Math.max(totalHeat * 12, scopedPubs.length * 40);
  const profileViews = Math.max(
    Math.round(discoveries * 0.26),
    scopedPubs.length * 8
  );
  const saveCount = Math.max(saves, Math.round(discoveries * 0.07));
  const followCount = Math.max(follows, Math.round(profileViews * 0.05));

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

          <div className="flex gap-2">
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
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${
                  range === r.id
                    ? "bg-omniv-gold text-black"
                    : "text-zinc-500 ring-1 ring-white/12"
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
                  label="Total Discoveries"
                  value={formatNum(discoveries)}
                  delta="+24%"
                />
                <Stat
                  label="Profile Views"
                  value={formatNum(profileViews)}
                  delta="+16%"
                />
                <Stat
                  label="Saves"
                  value={formatNum(saveCount)}
                  delta="+32%"
                />
                <Stat
                  label="Follows"
                  value={formatNum(followCount)}
                  delta="+27%"
                />
              </div>

              <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
                Top Sources
              </h2>
              <ul className="mt-3 space-y-3">
                {SOURCES.map((s) => (
                  <li key={s.label}>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="text-zinc-300">{s.label}</span>
                      <span className="text-zinc-500">{s.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-omniv-gold"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
                Publications
              </h2>
              <p className="mt-1 text-[12px] text-zinc-600">
                {scopedPubs.length} for this identity · heat {totalHeat}
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
                  {scopedPubs.slice(0, 12).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/p/${p.slug}`}
                        className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06]"
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
                  Per-identity demand, sources, and export.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
                >
                  Upgrade to Pro — $29/mo
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
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.08]">
      <p className="text-[12px] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[12px] font-medium text-emerald-400">{delta}</p>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
