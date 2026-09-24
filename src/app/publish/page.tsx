"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import {
  PUBLICATION_LABELS,
  PUBLICATION_TYPES,
  type PublicationType,
} from "@/lib/discovery/types";

const TYPE_ICONS: Record<PublicationType, string> = {
  article: "📄",
  music: "♪",
  video: "▶",
  research: "▣",
  product: "◇",
  event: "📅",
  opportunity: "◎",
  announcement: "📣",
  file: "📁",
};

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "form">("pick");
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [tags, setTags] = useState("");
  const [meta, setMeta] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function pickType(t: PublicationType) {
    setPubType(t);
    setStep("form");
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pubType) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: pubType,
          title,
          summary,
          body,
          publisherName,
          tags,
          meta,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/signup?from=publish&next=/publish");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not publish");
        return;
      }
      router.push(data.path || "/explore");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
          <div className="flex items-center gap-2">
            {step === "form" && (
              <button
                type="button"
                onClick={() => setStep("pick")}
                className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white"
                aria-label="Back"
              >
                ←
              </button>
            )}
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-[15px] font-semibold text-white">
              {step === "pick" ? "Create" : "Publish"}
            </span>
          </div>
          <Link
            href="/home"
            className="text-[13px] text-zinc-500 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-28 pt-6 md:max-w-2xl">
        {step === "pick" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Create
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Share your work with the world.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {PUBLICATION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => pickType(t)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-5 transition hover:border-omniv-gold/40 hover:bg-omniv-gold/5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-300">
                    {TYPE_ICONS[t]}
                  </span>
                  <span className="text-[12px] font-medium text-zinc-300">
                    {PUBLICATION_LABELS[t]}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-10 text-center text-[13px] text-zinc-600">
              Already published?{" "}
              <Link href="/explore" className="text-omniv-gold hover:underline">
                Explore the network
              </Link>
            </p>
          </>
        )}

        {step === "form" && pubType && (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-omniv-gold/15 text-lg">
                {TYPE_ICONS[pubType]}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Publishing
                </p>
                <p className="text-[16px] font-semibold text-white">
                  {PUBLICATION_LABELS[pubType]}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  Publish as
                </label>
                <input
                  required
                  value={publisherName}
                  onChange={(e) => setPublisherName(e.target.value)}
                  placeholder="Your name, company, or brand"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
                />
                <p className="mt-1.5 text-[11px] text-zinc-600">
                  Choose who you're publishing for.
                </p>
              </div>

              <div>
                <label className="text-[12px] font-medium text-zinc-400">
                  Title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is this called?"
                  className="mt-1 h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[15px] text-white outline-none focus:border-omniv-gold/40"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-zinc-400">
                  Summary
                </label>
                <input
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="One or two lines explorers see first"
                  className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-zinc-400">
                  Body (optional)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder="Full text, notes, or description"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-[14px] text-white outline-none focus:border-omniv-gold/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-medium text-zinc-400">
                    Meta
                  </label>
                  <input
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    placeholder='e.g. "8 min read"'
                    className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-zinc-400">
                    Tags
                  </label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="AI, Africa"
                    className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-omniv-gold py-3.5 text-[15px] font-semibold text-black shadow-lg shadow-omniv-gold/15 transition hover:bg-omniv-gold/90 disabled:opacity-60"
              >
                {loading ? "Publishing…" : "Publish"}
              </button>
            </form>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
