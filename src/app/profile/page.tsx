"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfilePosts } from "@/components/discovery/profile-posts";
import { FirstAccountNudge } from "@/components/discovery/first-account-nudge";
import { NotificationBell } from "@/components/discovery/notification-bell";
import {
  readSaved,
  type SavedItem,
} from "@/lib/discovery/local-graph";
import {
  readProfile,
  writeProfile,
  type LocalProfile,
} from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type Tab = "posts" | "saved" | "activity";

export default function ProfilePage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [tab, setTab] = useState<Tab>("posts");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LocalProfile | null>(null);

  useEffect(() => {
    const p = readProfile();
    setProfile(p);
    setDraft(p);
    setActive(readActiveAccount());
    return onAccountSwitch(setActive);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [fRes, sRes] = await Promise.all([
          fetch("/api/discovery/follow"),
          fetch("/api/discovery/save"),
        ]);
        const fData = await fRes.json();
        const sData = await sRes.json();
        if (cancelled) return;
        if (Array.isArray(fData.follows)) setFollowingCount(fData.follows.length);
        if (sData.auth && Array.isArray(sData.saves)) setSaved(sData.saves);
        else setSaved(readSaved());
      } catch {
        if (!cancelled) setSaved(readSaved());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!profile || !draft) {
    return (
      <DiscoveryShell>
        <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-zinc-500">
          Loading…
        </div>
      </DiscoveryShell>
    );
  }

  const show = editing ? draft : profile;

  function saveEdit() {
    if (!draft) return;
    writeProfile(draft);
    setProfile(draft);
    setEditing(false);
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <div className="relative aspect-[3/1] max-h-[220px] min-h-[160px] overflow-hidden bg-zinc-900 sm:max-h-[280px]">
          {show.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={show.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-omniv-gold/20 via-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-28 md:max-w-2xl md:px-6">
          <div className="-mt-12 flex items-end justify-between">
            <div className="h-[92px] w-[92px] overflow-hidden rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 ring-4 ring-[#050505]">
              {show.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={show.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-black">
                  {(show.displayName || "Y").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mb-1 rounded-full px-5 py-2 text-[13px] font-semibold text-white ring-1 ring-white/30 hover:bg-white/5"
              >
                Edit profile
              </button>
            ) : (
              <div className="mb-1 flex gap-2">
                <button type="button" onClick={() => { setDraft(profile); setEditing(false); }} className="rounded-full px-3 py-2 text-[13px] text-zinc-400 ring-1 ring-white/15">
                  Cancel
                </button>
                <button type="button" onClick={saveEdit} className="rounded-full bg-omniv-gold px-4 py-2 text-[13px] font-semibold text-black">
                  Save
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <>
              <h1 className="mt-3 text-[22px] font-bold text-white">{show.displayName || "You"}</h1>
              <p className="text-[14px] text-zinc-500">@{show.handle || "you"}</p>
              {show.bio && <p className="mt-2 text-[15px] leading-relaxed text-zinc-200">{show.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-zinc-500">
                {show.location && <span>⌖ {show.location}</span>}
                {show.website && (
                  <a href={show.website.startsWith("http") ? show.website : `https://${show.website}`} target="_blank" rel="noopener noreferrer" className="text-omniv-gold">
                    ↗ {show.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 text-[14px]">
                <Link href="/following" className="hover:underline">
                  <span className="font-bold text-white">{followingCount}</span>{" "}
                  <span className="text-zinc-500">Following</span>
                </Link>
                <Link href="/followers" className="hover:underline">
                  <span className="font-bold text-white">0</span>{" "}
                  <span className="text-zinc-500">Followers</span>
                </Link>
                <Link href="/saved" className="hover:underline">
                  <span className="font-bold text-white">{saved.length}</span>{" "}
                  <span className="text-zinc-500">Saved</span>
                </Link>
              </div>
              <FirstAccountNudge />
              <Link href="/accounts" className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.08]">
                <div>
                  <p className="text-[14px] font-medium text-white">Your entities</p>
                  <p className="text-[12px] text-zinc-500">Switch identity — each entity is its own account</p>
                </div>
                <span className="text-omniv-gold">›</span>
              </Link>
            </>
          ) : (
            <div className="mt-6 space-y-3">
              {(["displayName", "handle", "bio", "location", "website"] as const).map((key) => (
                <label key={key} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{key}</span>
                  <input
                    value={(draft as Record<string, string>)[key] || ""}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/10"
                  />
                </label>
              ))}
            </div>
          )}

          {!editing && (
            <>
              <div className="mt-7 flex border-b border-white/[0.08]">
                {(["posts", "saved", "activity"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`relative flex-1 py-3.5 text-[14px] font-semibold capitalize transition ${
                      tab === t ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {t}
                    {tab === t && (
                      <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-omniv-gold" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-1">
                {tab === "posts" && <ProfilePosts />}
                {tab === "saved" &&
                  (saved.length === 0 ? (
                    <p className="py-10 text-center text-[14px] text-zinc-500">Nothing saved yet.</p>
                  ) : (
                    <ul className="divide-y divide-white/[0.06]">
                      {saved.map((s) => (
                        <li key={`${s.kind}-${s.type}-${s.slug}`} className="py-3">
                          <Link
                            href={s.kind === "entity" ? `/e/${s.type}/${s.slug}` : `/p/${s.slug}`}
                            className="text-[14px] font-medium text-white hover:text-omniv-gold"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                {tab === "activity" && (
                  <p className="py-10 text-center text-[14px] text-zinc-500">
                    <Link href="/activity" className="text-omniv-gold">Open activity →</Link>
                  </p>
                )}
              </div>
            </>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
