"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type Pub = {
  id: string;
  title: string;
  type: string;
  slug: string;
  heat?: number;
};

export default function AnalyticsPage() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/discovery/publications/list?owner=me&limit=20");
        const data = await res.json();
        setAuth(data.auth !== false);
        setPubs(data.publications || []);
      } catch {
        setAuth(false);
        setPubs([]);
      }
    })();
  }, []);

  const totalHeat = pubs.reduce((s, p) => s + (p.heat || 0), 0);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={28} height={28} className="rounded-md md:hidden" />
              <span className="text-[17px] font-semibold text-white">Analytics</span>
            </div>
            <Link href="/pricing" className="text-[13px] font-medium text-omniv-gold">
              Upgrade to Pro
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-6 md:max-w-2xl md:px-6">
          <p className="text-[14px] text-zinc-500">
            How your publications are performing. Deeper insights unlock with Pro.
          </p>

          {auth === false && (
            <div className="mt-10 text-center">
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
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.08]">
                  <p className="text-[12px] text-zinc-500">Publications</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{pubs.length}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.08]">
                  <p className="text-[12px] text-zinc-500">Total heat</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{totalHeat}</p>
                </div>
              </div>

              <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
                Your posts
              </h2>

              {pubs.length === 0 ? (
                <p className="mt-6 text-center text-[14px] text-zinc-500">
                  No publications yet.{" "}
                  <Link href="/publish" className="text-omniv-gold">
                    Publish something
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {pubs.map((p) => (
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
                        <span className="text-[13px] text-zinc-400">
                          {p.heat ?? 0}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/25">
                <p className="text-[15px] font-semibold text-white">
                  Unlock full analytics with Pro
                </p>
                <p className="mt-1 text-[13px] text-zinc-400">
                  Audience cities, save trends, verified badge, and more.
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
