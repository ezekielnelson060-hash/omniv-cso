"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { timeAgo } from "@/lib/discovery/time-ago";
import {
  ensureDemoActivity,
  groupActivityByDay,
  kindLabel,
  type MyActivityItem,
} from "@/lib/discovery/my-activity";
import {
  onAccountSwitch,
  readActiveAccount,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

export default function ActivityPage() {
  const [items, setItems] = useState<MyActivityItem[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<ActiveAccount | null>(null);

  useEffect(() => {
    setActive(readActiveAccount());
    return onAccountSwitch(setActive);
  }, []);

  useEffect(() => {
    setItems(ensureDemoActivity());
    setReady(true);
    const onUp = () => setItems(ensureDemoActivity());
    window.addEventListener("omniv-my-activity", onUp);
    return () => window.removeEventListener("omniv-my-activity", onUp);
  }, []);

  const groups = useMemo(() => groupActivityByDay(items), [items]);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-[17px] font-semibold tracking-tight text-white">
                Activity
              </span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <p className="text-[13px] text-zinc-500">
            What you've been doing
            {active ? ` as ${active.name}` : ""}.{" "}
            <Link href="/notifications" className="text-omniv-gold hover:underline">
              Notifications
            </Link>{" "}
            are what happened to you.
          </p>

          {!ready ? (
            <p className="mt-16 text-center text-[14px] text-zinc-600">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-[15px] text-zinc-400">No activity yet</p>
              <p className="mt-2 text-[13px] text-zinc-600">
                Publish, save, and follow — it shows up here.
              </p>
              <Link
                href="/publish"
                className="mt-6 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Publish something
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              {groups.map((g) => (
                <section key={g.label} className="mb-8">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                    {g.label}
                  </p>
                  <ul className="space-y-1">
                    {g.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href || "/home"}
                          className="flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04]"
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold uppercase text-omniv-gold">
                            {kindLabel(item.kind).slice(0, 3)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-zinc-400">
                              {kindLabel(item.kind)}
                            </p>
                            <p className="mt-0.5 text-[14px] font-semibold text-white">
                              {item.subtitle || item.title}
                            </p>
                            {item.subtitle && (
                              <p className="mt-0.5 truncate text-[12px] text-zinc-600">
                                {item.title}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] text-zinc-600">
                              {timeAgo(item.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
