"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CoverUpload } from "@/components/discovery/cover-upload";
import {
  readProfile,
  writeProfile,
} from "@/lib/discovery/local-profile";

/** Mockup screens 1–2 — guided personal profile */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const existing = typeof window !== "undefined" ? readProfile() : null;
  const [name, setName] = useState(existing?.displayName || "");
  const [handle, setHandle] = useState(existing?.handle || "");
  const [bio, setBio] = useState(existing?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    existing?.avatarUrl || null
  );
  const [location, setLocation] = useState(existing?.location || "");

  function saveAndNext() {
    writeProfile({
      displayName: name.trim() || "You",
      handle: (handle || name || "you")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 24) || "you",
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl: avatarUrl || undefined,
    });
    if (step < 3) setStep(step + 1);
    else router.push("/accounts");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#050505] text-zinc-100">
      <header className="flex items-center justify-between px-4 py-4">
        <Image src="/logo.svg" alt="Omniv" width={28} height={28} />
        <span className="text-[13px] text-zinc-500">Step {step} of 3</span>
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
              <span className="text-[12px] text-zinc-400">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ezekiel Nelson"
                className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-4 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] text-zinc-400">Username</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="ezekielnelson"
                className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-4 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] text-zinc-400">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Creative director, builder…"
                className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-white">Where are you?</h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Helps discovery and local opportunities.
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
            <h1 className="text-2xl font-semibold text-white">You're in</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
              Next: create entity pages for companies, brands, artists, or
              projects you represent — then publish.
            </p>
            <ul className="mt-6 space-y-3 text-[14px] text-zinc-400">
              <li className="flex gap-2">
                <span className="text-omniv-gold">✓</span> Personal profile ready
              </li>
              <li className="flex gap-2">
                <span className="text-omniv-gold">✓</span> Switch identities anytime
              </li>
              <li className="flex gap-2">
                <span className="text-omniv-gold">✓</span> Publish & get discovered
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
            {step === 3 ? "Create an entity" : "Next"}
          </button>
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="mt-3 w-full text-center text-[13px] text-zinc-500"
            >
              Skip
            </button>
          )}
          {step === 3 && (
            <Link
              href="/home"
              className="mt-3 block text-center text-[13px] text-zinc-500"
            >
              Go to feed instead
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
