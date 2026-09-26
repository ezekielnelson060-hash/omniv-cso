"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CoverUpload } from "@/components/discovery/cover-upload";
import {
  readProfile,
  writeProfile,
} from "@/lib/discovery/local-profile";
import {
  INTEREST_GROUPS,
  readInterests,
  writeInterests,
} from "@/lib/discovery/interests";

/** Profile → Location → Interests → Ready. Interests seed the For You vector. */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get("step") === "interests") setStep(3);
      }
      const existing = readProfile();
      if (existing?.displayName) setName(existing.displayName);
      if (existing?.handle) setHandle(existing.handle);
      if (existing?.bio) setBio(existing.bio);
      if (existing?.avatarUrl) setAvatarUrl(existing.avatarUrl);
      if (existing?.location) setLocation(existing.location);
      setSelected(readInterests());
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function toggleInterest(item: string) {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((x) => x !== item)
        : prev.length >= 12
          ? prev
          : [...prev, item]
    );
  }

  function saveProfile() {
    const existing = readProfile();
    writeProfile({
      displayName: name.trim() || "You",
      handle:
        (handle || name || "you")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 24) || "you",
      bio: bio.trim(),
      location: location.trim(),
      joinedAt: existing.joinedAt,
      avatarUrl: avatarUrl || undefined,
    });
  }

  function saveAndNext() {
    if (step === 1 || step === 2) {
      saveProfile();
      setStep(step + 1);
      return;
    }
    if (step === 3) {
      writeInterests(selected);
      setStep(4);
      return;
    }
    router.push("/home");
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-zinc-600">
        Loading…
      </div>
    );
  }

  const total = 4;

  return (
    <div className="flex min-h-dvh flex-col bg-[#050505] text-zinc-100">
      <header className="flex items-center justify-between px-4 py-4">
        <Image src="/logo.svg" alt="Omniv" width={28} height={28} />
        <span className="text-[13px] text-zinc-500">
          Step {step} of {total}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-white">
              Create your profile
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Your main identity in the network.
            </p>

            <div className="mt-8 flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-3xl font-semibold text-omniv-gold ring-2 ring-white/10">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (name || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="mt-3 w-full max-w-[200px]">
                <CoverUpload
                  label="Add photo"
                  tall
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                />
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-[12px] text-zinc-400">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-4 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] text-zinc-400">Handle</span>
              <div className="mt-1.5 flex h-12 items-center rounded-xl bg-white/[0.04] px-4 ring-1 ring-white/[0.08] focus-within:ring-omniv-gold/40">
                <span className="text-zinc-500">@</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="you"
                  className="ml-1 flex-1 bg-transparent text-[15px] text-white outline-none"
                />
              </div>
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] text-zinc-400">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="What do you publish or explore?"
                className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-white">Where are you?</h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Helps local discovery and opportunities.
            </p>
            <label className="mt-8 block">
              <span className="text-[12px] text-zinc-400">Location</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lagos, Nigeria"
                className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-4 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
              />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-semibold text-white">
              What do you want to discover?
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Choose up to 12. This shapes your For You feed.
            </p>
            <div className="mt-6 space-y-5 overflow-y-auto">
              {INTEREST_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {group.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const on = selected.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleInterest(item)}
                          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                            on
                              ? "bg-omniv-gold text-black"
                              : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-zinc-600">
              {selected.length}/12 selected
            </p>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-2xl font-semibold text-white">You're in</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
              Open For You for personalized discovery. Follow entities so
              Following fills with people and companies you choose.
            </p>
            <ul className="mt-6 space-y-3 text-[14px] text-zinc-400">
              <li className="flex gap-2">
                <span className="text-omniv-gold">✓</span> Profile ready
              </li>
              <li className="flex gap-2">
                <span className="text-omniv-gold">✓</span> Interests set (
                {selected.length || "skip"})
              </li>
              <li className="flex gap-2">
                <span className="text-omniv-gold">✓</span> Publish & get
                discovered
              </li>
            </ul>
          </>
        )}

        <div className="mt-auto pt-10">
          <button
            type="button"
            onClick={saveAndNext}
            className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black"
          >
            {step === 4
              ? "Open For You"
              : step === 3
                ? selected.length
                  ? "Save interests"
                  : "Skip for now"
                : "Next"}
          </button>
          {step < 4 && (
            <button
              type="button"
              onClick={() => {
                if (step === 3) writeInterests(selected);
                setStep(step + 1);
              }}
              className="mt-3 w-full text-center text-[13px] text-zinc-500"
            >
              Skip
            </button>
          )}
          {step === 4 && (
            <Link
              href="/accounts"
              className="mt-3 block text-center text-[13px] text-zinc-500"
            >
              Create an entity instead
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
