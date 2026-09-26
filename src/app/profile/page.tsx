"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfilePosts } from "@/components/discovery/profile-posts";
import { FirstAccountNudge } from "@/components/discovery/first-account-nudge";
import { PhotoPicker } from "@/components/discovery/photo-picker";
import { NotificationBell } from "@/components/discovery/notification-bell";
import {
  readFollows,
  readSaved,
  type FollowedRef,
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
} from "@/lib/discovery/active-account";

type Tab = "posts" | "saved" | "activity";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [follows, setFollows] = useState<FollowedRef[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LocalProfile | null>(null);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const active = readActiveAccount();
    if (active?.path) {
      router.replace(active.path);
      return;
    }
    setRedirecting(false);

    const p = readProfile();
    setProfile(p);
    setDraft(p);

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
        if (fData.auth && Array.isArray(fData.follows) && fData.follows.length) {
          setFollows(fData.follows as FollowedRef[]);
        } else {
          setFollows(readFollows());
        }
        if (sData.auth && Array.isArray(sData.saves) && sData.saves.length) {
          setSaved(sData.saves as SavedItem[]);
        } else {
          setSaved(readSaved());
        }
      } catch {
        if (!cancelled) {
          setFollows(readFollows());
          setSaved(readSaved());
        }
      }
    })();

    const unsub = onAccountSwitch((a) => {
      if (a?.path) router.replace(a.path);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [router]);

  function saveEdit() {
    if (!draft) return;
    const clean: LocalProfile = {
      ...draft,
      handle:
        draft.handle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "explorer",
      displayName: draft.displayName.trim() || "Explorer",
      website: (draft.website || "").trim(),
    };
    writeProfile(clean);
    setProfile(clean);
    setDraft(clean);
    setEditing(false);
  }

  function setPhoto(field: "coverUrl" | "avatarUrl", url: string | null) {
    if (!draft || !profile) return;
    const next = { ...draft, [field]: url };
    setDraft(next);
    const stuck = { ...profile, [field]: url };
    writeProfile(stuck);
    setProfile(stuck);
  }

  if (redirecting || !profile || !draft) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-zinc-500">
        Loading…
      </div>
    );
  }

  const show = editing ? draft : profile;
  const initial = show.displayName.charAt(0).toUpperCase();

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        {/* Wide rectangular cover */}
        <div className="relative aspect-[3/1] max-h-[200px] min-h-[140px] overflow-hidden bg-zinc-900 sm:max-h-[240px]">
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

          <div className="absolute left-3 top-3 flex items-center gap-2 md:hidden">
            <Link
              href="/home"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              aria-label="Back"
            >
              ←
            </Link>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {editing ? (
              <PhotoPicker
                kind="cover"
                value={draft.coverUrl}
                onChange={(url) => setPhoto("coverUrl", url)}
              />
            ) : (
              <>
                <NotificationBell />
                <Image
                  src="/logo.svg"
                  alt=""
                  width={22}
                  height={22}
                  className="opacity-80 md:hidden"
                />
              </>
            )}
          </div>
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-28 md:max-w-2xl md:px-6">
          <div className="-mt-12 flex items-end justify-between">
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
                    {initial}
                  </span>
                )}
              </div>
              {editing && (
                <div className="absolute bottom-0 right-0">
                  <PhotoPicker
                    kind="avatar"
                    value={draft.avatarUrl}
                    onChange={(url) => setPhoto("avatarUrl", url)}
                  />
                </div>
              )}
            </div>

            {!editing ? (
              <div className="mb-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-transparent px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/5"
                >
                  Edit profile
                </button>
              </div>
            ) : (
              <div className="mb-1 flex gap-2">
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

          {editing ? (
            <div className="mt-6 space-y-0 divide-y divide-white/[0.08]">
              <EditField
                label="Name"
                value={draft.displayName}
                onChange={(v) => setDraft({ ...draft, displayName: v })}
              />
              <EditField
                label="Handle"
                value={draft.handle}
                onChange={(v) => setDraft({ ...draft, handle: v })}
                prefix="@"
              />
              <EditField
                label="Bio"
                value={draft.bio}
                onChange={(v) => setDraft({ ...draft, bio: v })}
                multiline
              />
              <EditField
                label="Location"
                value={draft.location}
                onChange={(v) => setDraft({ ...draft, location: v })}
              />
              <EditField
                label="Website"
                value={draft.website || ""}
                onChange={(v) => setDraft({ ...draft, website: v })}
              />
              <p className="pt-4 text-[12px] text-zinc-600">
                Tap the camera on the cover or photo to change images. They save
                immediately.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mt-3 text-[20px] font-bold tracking-tight text-white">
                {profile.displayName}
              </h1>
              <p className="text-[14px] text-zinc-500">@{profile.handle}</p>

              {profile.bio && (
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-200">
                  {profile.bio}
                </p>
              )}

              {/* X-style meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-zinc-500">
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MetaIcon name="pin" />
                    {profile.location}
                  </span>
                )}
                {profile.website ? (
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-omniv-gold hover:underline"
                  >
                    <MetaIcon name="link" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <MetaIcon name="calendar" />
                  Joined{" "}
                  {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-4 flex gap-5 text-[14px]">
                <Link href="/following" className="hover:underline">
                  <span className="font-bold text-white">{follows.length}</span>{" "}
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
          )}

          {!editing && (
            <>
              <div className="mt-7 flex border-b border-white/[0.08]">
                {(
                  [
                    { id: "posts" as const, label: "Posts" },
                    { id: "saved" as const, label: "Saved" },
                    { id: "activity" as const, label: "Activity" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`relative flex-1 py-3 text-[14px] font-medium transition ${
                      tab === t.id ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {t.label}
                    {tab === t.id && (
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
                      Nothing saved.{" "}
                      <Link href="/explore" className="text-omniv-gold">
                        Explore
                      </Link>
                    </p>
                  ) : (
                    <ul className="divide-y divide-white/[0.06]">
                      {saved.slice(0, 20).map((x) => (
                        <li key={`${x.kind}-${x.slug}`}>
                          <Link
                            href={
                              x.kind === "publication"
                                ? `/p/${x.slug}`
                                : `/e/${x.type}/${x.slug}`
                            }
                            className="flex items-center justify-between py-3.5"
                          >
                            <span className="truncate text-[14px] text-white">
                              {x.name}
                            </span>
                            <span className="shrink-0 text-[11px] capitalize text-zinc-500">
                              {x.kind === "publication"
                                ? x.pubType ?? x.type
                                : x.type}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                {tab === "activity" && (
                  <div className="py-6 text-center">
                    <p className="text-[14px] text-zinc-500">
                      Your actions live on the Activity page.
                    </p>
                    <Link
                      href="/activity"
                      className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
                    >
                      Open Activity
                    </Link>
                  </div>
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

function MetaIcon({ name }: { name: "pin" | "link" | "calendar" }) {
  const p = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    className: "opacity-70",
  } as const;
  if (name === "pin")
    return (
      <svg {...p}>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  if (name === "link")
    return (
      <svg {...p}>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" strokeLinecap="round" />
        <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 7.07 7.07L14 18.07" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function EditField({
  label,
  value,
  onChange,
  prefix,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block py-3">
      <span className="text-[13px] text-zinc-500">{label}</span>
      <div className="mt-1 flex items-start">
        {prefix && (
          <span className="pt-1 text-[16px] text-zinc-500">{prefix}</span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent text-[16px] leading-relaxed text-white outline-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent py-1 text-[16px] text-white outline-none"
          />
        )}
      </div>
    </label>
  );
}
