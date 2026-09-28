"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  DEFAULT_NOTIF_SETTINGS,
  readNotifSettings,
  writeNotifSettings,
  type NotifSettings,
} from "@/lib/discovery/notification-settings";
import { SettingsToggle } from "@/components/discovery/settings-toggle";

type ToggleRow = { key: keyof NotifSettings; label: string };

const SECTIONS: { title: string; rows: ToggleRow[] }[] = [
  {
    title: "Push",
    rows: [
      { key: "pushFollowers", label: "New followers" },
      { key: "pushMentions", label: "Mentions" },
      { key: "pushComments", label: "Comments" },
      { key: "pushMessages", label: "Messages" },
      { key: "pushOpportunities", label: "Opportunities" },
      { key: "pushPublicationActivity", label: "Publication activity" },
    ],
  },
  {
    title: "Following",
    rows: [
      { key: "followingNewPubs", label: "New publications" },
      { key: "followingTrending", label: "Trending publications" },
      { key: "followingRecommended", label: "Recommended content" },
    ],
  },
  {
    title: "Your content",
    rows: [
      { key: "contentNewFollowers", label: "New followers" },
      { key: "contentSaves", label: "Saves" },
      { key: "contentComments", label: "Comments" },
      { key: "contentDiscovery", label: "Discovery milestones" },
    ],
  },
  {
    title: "Email",
    rows: [
      { key: "emailProduct", label: "Product updates" },
      { key: "emailDigest", label: "Weekly digest" },
      { key: "emailOpportunities", label: "Opportunities" },
      { key: "emailMarketing", label: "Marketing" },
    ],
  },
];

export default function NotificationSettingsPage() {
  const [s, setS] = useState<NotifSettings>({ ...DEFAULT_NOTIF_SETTINGS });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setS(readNotifSettings());
    setReady(true);
  }, []);

  function setKey(key: keyof NotifSettings, value: boolean | string) {
    setS((prev) => {
      const next = { ...prev, [key]: value } as NotifSettings;
      writeNotifSettings(next);
      return next;
    });
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh overflow-x-hidden bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
            >
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">
              Notifications
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
          {!ready ? (
            <p className="py-12 text-center text-zinc-600">Loading…</p>
          ) : (
            <>
              {SECTIONS.map((section) => (
                <section key={section.title} className="mb-7">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                    {section.title}
                  </p>
                  <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                    {section.rows.map((row, i) => (
                      <li
                        key={row.key}
                        className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                          i > 0 ? "border-t border-white/[0.05]" : ""
                        }`}
                      >
                        <span className="min-w-0 text-[14px] text-zinc-200">
                          {row.label}
                        </span>
                        <SettingsToggle
                          on={Boolean(s[row.key])}
                          onChange={(v) => setKey(row.key, v)}
                          label={row.label}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <section className="mb-7">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Quiet hours
                </p>
                <div className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="text-[14px] text-zinc-200">Enabled</span>
                    <SettingsToggle
                      on={s.quietHours}
                      onChange={(v) => setKey("quietHours", v)}
                      label="Quiet hours"
                    />
                  </div>
                  {s.quietHours && (
                    <div className="flex gap-3 border-t border-white/[0.05] px-4 py-3">
                      <label className="flex-1 text-[12px] text-zinc-500">
                        From
                        <input
                          type="time"
                          value={s.quietStart}
                          onChange={(e) => setKey("quietStart", e.target.value)}
                          className="mt-1 block w-full rounded-lg bg-white/[0.06] px-3 py-2 text-[14px] text-white outline-none"
                        />
                      </label>
                      <label className="flex-1 text-[12px] text-zinc-500">
                        To
                        <input
                          type="time"
                          value={s.quietEnd}
                          onChange={(e) => setKey("quietEnd", e.target.value)}
                          className="mt-1 block w-full rounded-lg bg-white/[0.06] px-3 py-2 text-[14px] text-white outline-none"
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[12px] text-zinc-600">
                  {s.quietStart} — {s.quietEnd} local time
                </p>
              </section>
            </>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
