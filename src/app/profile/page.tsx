"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfilePosts } from "@/components/discovery/profile-posts";
import { FirstAccountNudge } from "@/components/discovery/first-account-nudge";
import { CoverUpload } from "@/components/discovery/cover-upload";
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

type Tab = "posts" | "saved" | "activity";

export default function ProfilePage() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [follows, setFollows] = useState<FollowedRef[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LocalProfile | null>(null);

  useEffect(() => {
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
    return () => {
      cancelled = true;
    };
  }, []);

  function saveEdit() {
    if (!draft) return;
    const clean: LocalProfile = {
      ...draft,
      handle:
        draft.handle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "explorer",
      displayName: draft.displayName.trim() || "Explorer",
    };
    writeProfile(clean);
    setProfile(clean);
    setDraft(clean);
    setEditing(false);
  }

  function persistPhotos(next: Partial<LocalProfile>) {
    if (!profile) return;
    const clean = { ...profile, ...next };
    writeProfile(clean);
    setProfile(clean);
    setDraft(clean);
  }

  if (!profile || !draft) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-zinc-500">
        Loading…
      </div>
    );
  }

  const initial = profile.displayName.charAt(0).toUpperCase();

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        {/* Cover — photo sticks via localStorage + upload URL */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-omniv-gold/30 via-zinc-900 to-black sm:h-48">
          {profile.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,200,50,0.25),transparent_55%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 to-transparent" />
          <Link
            href="/home"
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm md:hidden"
            aria-label="Back"
          >
            ←
          </Link>
          <div className="absolute right-4 top-4 md:hidden">
            <Image src="/logo.svg" alt="" width={24} height={24} className="opacity-80" />
          </div>
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-28 md:max-w-2xl md:px-6">
          <div className="-mt-12 flex items-end justify-between">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 text-3xl font-semibold text-black ring-4 ring-[#050505]">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mb-1 rounded-full bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white ring-1 ring-white/15 transition hover:ring-white/30"
              >
                Edit Profile
              </button>
            ) : (
              <div className="mb-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(profile);
                    setEditing(false);
                  }}
                  className="rounded-full px-3 py-2 text-[13px] text-zinc-400 ring-1 ring-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"	def onClick={saveEdit}
                  className="rounded-full bg-omniv-gold px-4 py-2 text-[13px] font-semibold text-black"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-5 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Personal profile photos
              </p>
              <CoverUpload
                label="Change cover photo"
                value={draft.coverUrl}
                onChange={(url) => {
                  setDraft({ ...draft, coverUrl: url });
                  persistPhotos({ coverUrl: url });
                }}
              />
              <CoverUpload
                label="Change profile photo"
                tall
                value={draft.avatarUrl}
                onChange={(url) => {
                  setDraft({ ...draft, avatarUrl: url });
                  persistPhotos({ avatarUrl: url });
                }}
              />
              <Field
                label="Display name"
                value={draft.displayName}
                onChange={(v) => setDraft({ ...draft, displayName: v })}
              />
              <Field
                label="Handle"
                value={draft.handle}
                onChange={(v) => setDraft({ ...draft, handle: v })}
                prefix="@"
              />
              <Field
                label="Bio"
                value={draft.bio}
                onChange={(v) => setDraft({ ...draft, bio: v })}
                multiline
              />
              <Field
                label="Location"
                value={draft.location}
                onChange={(v) => setDraft({ ...draft, location: v })}
              />
            </div>
          ) : (
            <>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                Personal profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {profile.displayName}
              </h1>
              <p className="text-[14px] text-zinc-500">@{profile.handle}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-300">
                {profile.bio}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[13px] text-zinc-500">
                {profile.location && <span>📍 {profile.location}</span>}
                <span>
                  Joined{" "}
                  {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-5 flex gap-6">
                <Link href="/following" className="hover:opacity-90">
                  <span className="text-[16px] font-semibold text-white">
                    {follows.length}
                  </span>{" "}
                  <span className="text-[13px] text-zinc-500">Following</span>
                </Link>
                <span>
                  <span className="text-[16px] font-semibold text-white">0</span>{" "}
                  <span className="text-[13px] text-zinc-500">Followers</span>
                </span>
                <Link href="/saved" className="hover:opacity-90">
                  <span className="text-[16px] font-semibold text-white">
                    {saved.length}
                  </span>{" "}
                  <span className="text-[13px] text-zinc-500">Saved</span>
                </Link>
              </div>

              <FirstAccountNudge />

              <Link
                href="/accounts"
                className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.08] transition hover:ring-white/15"
              >
                <div>
                  <p className="text-[14px] font-medium text-white">
                    Your entities
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    Companies, artists, brands — publish as any of them. Separate
                    from this personal profile.
                  </p>
                </div>
                <span className="text-omniv-gold">›</span>
              </Link>
            </>
          )}

          <div className="mt-8 flex gap-1">
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
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                  tab === t.id
                    ? "bg-omniv-gold text-black"
                    : "text-zinc-500 ring-1 ring-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "posts" && (
              <>
                <p className="mb-3 text-[12px] text-zinc-500">
                  Everything you published across your entities.
                </p>
                <ProfilePosts />
              </>
            )}
            {tab === "saved" &&
              (saved.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-zinc-500">
                  Nothing saved.{" "}
                  <Link href="/explore" className="text-omniv-gold">
                    Explore
                  </Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {saved.slice(0, 20).map((x) => (
                    <li key={`${x.kind}-${x.slug}`}>
                      <Link
                        href={
                          x.kind === "publication"
                            ? `/p/${x.slug}`
                            : `/e/${x.type}/${x.slug}`
                        }
                        className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.06] transition hover:ring-white/15"
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
                  <li>
                    <Link
                      href="/saved"
                      className="block py-2 text-center text-[13px] text-omniv-gold"
                    >
                      See all saved →
                    </Link>
                  </li>
                </ul>
              ))}
            {tab === "activity" &&
              (follows.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-zinc-500">
                  Follow publishers to build your network.{" "}
                  <Link href="/explore" className="text-omniv-gold">
                    Explore
                  </Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {follows.map((f) => (
                    <li key={`${f.type}-${f.slug}`}>
                      <Link
                        href={`/e/${f.type}/${f.slug}`}
                        className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.06] transition hover:ring-white/15"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
                          {f.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-[14px] font-medium text-white">
                            {f.name}
                          </p>
                          <p className="text-[12px] capitalize text-zinc-500">
                            Entity · {f.type}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/activity"
                      className="block py-2 text-center text-[13px] text-omniv-gold"
                    >
                      Open activity feed →
                    </Link>
                  </li>
                </ul>
              ))}
          </div>
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}

function Field({
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
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <div className="mt-1 flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] focus-within:ring-omniv-gold/50">
        {prefix && (
          <span className="pl-3 text-[14px] text-zinc-500">{prefix}</span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-[14px] text-white outline-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent px-3 py-2.5 text-[14px] text-white outline-none"
          />
        )}
      </div>
    </label>
  );
}
