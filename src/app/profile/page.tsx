"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  onAccountSwitch,
} from "@/lib/discovery/active-account";

const MAX_DATA_URL = 900_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [draft, setDraft] = useState<LocalProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"posts" | "saved" | "activity">("posts");
  const [followingCount, setFollowingCount] = useState(0);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = readProfile();
    setProfile(p);
    setDraft(p);
    setSaved(readSaved());
    return onAccountSwitch(() => {
      const next = readProfile();
      setProfile(next);
      setDraft(next);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, s] = await Promise.all([
          fetch("/api/discovery/follow"),
          fetch("/api/discovery/save"),
        ]);
        if (cancelled) return;
        if (f.ok) {
          const j = await f.json();
          if (Array.isArray(j?.follows)) setFollowingCount(j.follows.length);
        }
        if (s.ok) {
          const j = await s.json();
          if (j?.auth && Array.isArray(j?.saves)) setSaved(j.saves);
          else setSaved(readSaved());
        }
      } catch {
        /* local fallback */
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

  async function onPickMedia(
    kind: "avatar" | "cover",
    file: File | null | undefined
  ) {
    if (!file || !draft) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl.length > MAX_DATA_URL) {
        alert("Image is too large. Use a smaller photo (under ~700KB).");
        return;
      }
      setDraft({
        ...draft,
        [kind === "avatar" ? "avatarUrl" : "coverUrl"]: dataUrl,
      });
    } catch {
      alert("Could not read that image.");
    }
  }

  return (
    <DiscoveryShell>
      <div className="mx-auto min-h-dvh w-full max-w-lg overflow-x-hidden bg-[#050505] text-zinc-100">
        <div className="relative aspect-[3/1] max-h-[180px] min-h-[140px] w-full overflow-hidden bg-zinc-900">
          {show.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={show.coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-omniv-gold/20 via-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <NotificationBell />
          </div>
          {editing && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-full bg-black/60 px-3 text-[12px] font-medium text-white ring-1 ring-white/20 backdrop-blur"
            >
              <CameraIcon />
              Edit cover
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickMedia("cover", e.target.files?.[0])}
          />
        </div>

        <main className="relative w-full px-4 pb-28">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <div className="relative">
              <div className="h-[88px] w-[88px] overflow-hidden rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 ring-4 ring-[#050505]">
                {show.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={show.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-black">
                    {(show.displayName || "Y").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white ring-2 ring-[#050505]"
                  aria-label="Change photo"
                >
                  <CameraIcon />
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickMedia("avatar", e.target.files?.[0])}
              />
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mb-1 shrink-0 rounded-full px-5 py-2 text-[13px] font-semibold text-white ring-1 ring-white/30 hover:bg-white/5"
              >
                Edit profile
              </button>
            ) : (
              <div className="mb-1 flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(profile);
                    setEditing(false);
                  }}
                  className="rounded-full px-3 py-2 text-[13px] text-zinc-400 ring-1 ring-white/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-full bg-omniv-gold px-4 py-2 text-[13px] font-semibold text-black"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <>
              <h1 className="mt-3 text-[22px] font-bold text-white">
                {show.displayName || "You"}
              </h1>
              <p className="text-[14px] text-zinc-500">@{show.handle || "you"}</p>
              {show.bio && (
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-200">
                  {show.bio}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-zinc-500">
                {show.location && <span>⌖ {show.location}</span>}
                {show.website && (
                  <a
                    href={
                      show.website.startsWith("http")
                        ? show.website
                        : `https://${show.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-omniv-gold"
                  >
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
              <Link
                href="/accounts"
                className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.08]"
              >
                <div>
                  <p className="text-[14px] font-medium text-white">
                    Your entities
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    Switch identity — each entity is its own account
                  </p>
                </div>
                <span className="text-omniv-gold">›</span>
              </Link>
            </>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-[12px] text-zinc-500">
                Tap the cover or photo to change them — same flow as X.
              </p>
              {(
                [
                  ["displayName", "Display name"],
                  ["handle", "Handle"],
                  ["bio", "Bio"],
                  ["location", "Location"],
                  ["website", "Website"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    {label}
                  </span>
                  {key === "bio" ? (
                    <textarea
                      value={draft.bio || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, bio: e.target.value })
                      }
                      rows={3}
                      className="mt-1 w-full resize-none rounded-xl bg-white/[0.04] px-3 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/10"
                    />
                  ) : (
                    <input
                      value={(draft as Record<string, string>)[key] || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/10"
                    />
                  )}
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
                    <p className="py-10 text-center text-[14px] text-zinc-500">
                      Nothing saved yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-white/[0.06]">
                      {saved.map((s) => (
                        <li
                          key={`${s.kind}-${s.type}-${s.slug}`}
                          className="py-3"
                        >
                          <Link
                            href={
                              s.kind === "entity"
                                ? `/e/${s.type}/${s.slug}`
                                : `/p/${s.slug}`
                            }
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
                    <Link href="/activity" className="text-omniv-gold">
                      Open activity →
                    </Link>
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

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
