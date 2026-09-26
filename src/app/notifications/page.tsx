"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { timeAgo } from "@/lib/discovery/time-ago";
import {
  ensureDemoNotifications,
  filterNotifications,
  groupByDay,
  markAllRead,
  markRead,
  type OmnivNotification,
} from "@/lib/discovery/notifications";

const TABS = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "followers", label: "Followers" },
  { id: "activity", label: "Activity" },
] as const;

export default function NotificationsPage() {
  const [items, setItems] = useState<OmnivNotification[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(ensureDemoNotifications());
    setReady(true);
  }, []);

  const filtered = useMemo(
    () => filterNotifications(items, tab),
    [items, tab]
  );
  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  function onMarkAll() {
    const next = markAllRead(items);
    setItems(next);
    window.dispatchEvent(new Event("omniv-notifications"));
  }

  function onOpen(n: OmnivNotification) {
    const next = markRead(items, n.id);
    setItems(next);
    window.dispatchEvent(new Event("omniv-notifications"));
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
            <h1 className="text-[17px] font-semibold text-white">
              Notifications
            </h1>
            <button
              type="button"
              onClick={onMarkAll}
              className="text-[13px] font-medium text-omniv-gold"
            >
              Mark all read
            </button>
          </div>

          <div className="mx-auto flex max-w-lg gap-1 overflow-x-auto px-4 pb-3 scrollbar-none md:max-w-2xl">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium ${
                  tab === t.id
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          {!ready && (
            <p className="py-16 text-center text-[14px] text-zinc-600">
              Loading…
            </p>
          )}

          {ready && filtered.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-[15px] text-zinc-400">You're all caught up</p>
              <p className="mt-2 text-[13px] text-zinc-600">
                Follows, saves, and discoveries show up here.
              </p>
            </div>
          )}

          {groups.map((g) => (
            <section key={g.label} className="mb-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {g.label}
              </p>
              <ul className="space-y-1">
                {g.items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href || "/home"}
                      onClick={() => onOpen(n)}
                      className={`flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04] ${
                        n.read ? "opacity-70" : "bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-omniv-gold"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-white">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 truncate text-[13px] text-zinc-500">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-zinc-600">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {n.href && (
                        <span className="self-center text-[12px] text-omniv-gold">
                          View
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
