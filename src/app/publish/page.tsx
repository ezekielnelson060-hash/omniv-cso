"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ENTITY_LABELS,
  ENTITY_TYPES,
  INTENT_LABELS,
  INTENT_KINDS,
  type EntityType,
  type IntentKind,
} from "@/lib/discovery/types";

export default function PublishPage() {
  const router = useRouter();
  const [type, setType] = useState<EntityType>("company");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [intent, setIntent] = useState<IntentKind | "">("");
  const [intentDetail, setIntentDetail] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          tagline,
          location,
          about,
          intent: intent || undefined,
          intentDetail,
          tags,
          link,
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
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
            <span className="text-[15px] font-semibold">Omniv</span>
          </Link>
          <Link href="/explore" className="text-[13px] text-zinc-400 hover:text-white">
            Explore
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Publish</h1>
        <p className="mt-1 text-[14px] text-zinc-500">
          Add something to the discovery network. Type + intent help people find you.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-[12px] font-medium text-zinc-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EntityType)}
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-[#0a0a0a] px-3 text-[14px] text-white"
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ENTITY_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Company, product, or person name"
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">Tagline</label>
            <input
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One line that explains what this is"
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">Location (optional)</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country, or Remote"
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              placeholder="What should people know?"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-[14px] text-white outline-none focus:border-omniv-gold/40"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">Intent</label>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value as IntentKind | "")}
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-[#0a0a0a] px-3 text-[14px] text-white"
            >
              <option value="">None for now</option>
              {INTENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {INTENT_LABELS[k]}
                </option>
              ))}
            </select>
            {intent && (
              <input
                value={intentDetail}
                onChange={(e) => setIntentDetail(e.target.value)}
                placeholder="Optional detail (e.g. Seed round, ML roles)"
                className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
              />
            )}
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, fintech, design"
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-400">Website / link (optional)</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
              className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-omniv-gold/40"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Publishing…" : "Publish on Omniv"}
          </button>
        </form>
      </main>
    </div>
  );
}
