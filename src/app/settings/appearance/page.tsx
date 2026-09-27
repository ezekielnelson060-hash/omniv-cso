"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { useTheme } from "@/components/theme-provider";

type ThemePreference = "dark" | "light" | "system";

export default function AppearanceSettingsPage() {
  const { preference, setPreference, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? preference : "dark";

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Appearance</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5">
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
                onClick={() => setPreference(t.id as ThemePreference)}
                className={`rounded-2xl py-4 text-[14px] font-medium ring-1 transition ${
                  current === t.id
                    ? "bg-omniv-gold/15 text-omniv-gold ring-omniv-gold/40"
                    : "bg-white/[0.03] text-zinc-400 ring-white/[0.06]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-zinc-500">
            Omniv is designed dark-first. Active theme:{" "}
            <span className="font-medium text-zinc-300">
              {mounted ? theme : "…"}
            </span>
            .
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
