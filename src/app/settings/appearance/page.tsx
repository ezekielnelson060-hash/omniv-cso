"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type Theme = "dark" | "light" | "system";

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Appearance</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5 md:max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Theme
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "dark" as const, label: "Dark" },
                { id: "light" as const, label: "Light" },
                { id: "system" as const, label: "System" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`rounded-2xl py-4 text-[14px] font-medium ring-1 transition ${
                  theme === t.id
                    ? "bg-omniv-gold/15 text-omniv-gold ring-omniv-gold/40"
                    : "bg-white/[0.03] text-zinc-400 ring-white/[0.06]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-zinc-500">
            Omniv is designed dark-first. Light mode is experimental.
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
