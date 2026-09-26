"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  readActiveAccount,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";

export default function PublishingSettingsPage() {
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [name, setName] = useState("Personal");
  const [comments, setComments] = useState(true);
  const [downloads, setDownloads] = useState(true);

  useEffect(() => {
    const a = readActiveAccount();
    setActive(a);
    if (a) setName(a.name);
    else {
      try {
        setName(readProfile().displayName || "Personal");
      } catch {
        setName("Personal");
      }
    }
  }, []);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Publishing</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-5 md:max-w-2xl">
          <div className="rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.06]">
            <p className="text-[12px] text-zinc-500">Default publishing identity</p>
            <p className="mt-1 text-[15px] font-semibold text-white">{name}</p>
            <p className="mt-1 text-[12px] capitalize text-zinc-500">
              {active ? active.type : "Personal"}
            </p>
            <Link
              href="/accounts"
              className="mt-3 inline-block text-[13px] text-omniv-gold"
            >
              Switch identity →
            </Link>
          </div>

          <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            <li className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[14px] text-zinc-200">Allow comments</span>
              <button
                type="button"
                role="switch"
                aria-checked={comments}
                onClick={() => setComments((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition ${
                  comments ? "bg-omniv-gold" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    comments ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
            <li className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3.5">
              <span className="text-[14px] text-zinc-200">
                Allow downloads (files / music)
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={downloads}
                onClick={() => setDownloads((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition ${
                  downloads ? "bg-omniv-gold" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    downloads ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          </ul>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
