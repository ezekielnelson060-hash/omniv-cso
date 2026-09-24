"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  PUBLISHER_LABELS,
  PUBLISHER_TYPES,
  type PublisherType,
} from "@/lib/discovery/types";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  tagline: string;
  location?: string;
  path: string;
};

export default function AccountsPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<PublisherType>("person");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/discovery/entities");
      const data = await res.json();
      setAuth(Boolean(data.auth));
      setEntities(data.entities || []);
    } catch {
      setAuth(false);
      setEntities([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, tagline, location, about }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/signup?next=/accounts");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not create");
        return;
      }
      setShowForm(false);
      setName("");
      setTagline("");
      setLocation("");
      setAbout("");
      await load();
      if (data.path) router.push(data.path);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white"
              >
                ←
              </Link>
              <span className="text-[15px] font-semibold text-white">
                Your accounts
              </span>
            </div>
            <Image
              src="/logo.svg"
              alt=""
              width={24}
              height={24}
              className="opacity-80 md:hidden"
            />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5 md:max-w-2xl md:px-6">
          <p className="text-[14px] leading-relaxed text-zinc-400">
            One login. Multiple presence on Omniv — your personal profile,
            company, brand, or project. Publish under the right one every time.
          </p>

          {auth === false && (
            <div className="mt-8 rounded-2xl bg-white/[0.03] p-5 text-center ring-1 ring-white/[0.08]">
              <p className="text-[14px] text-zinc-400">
                Sign in to manage accounts.
              </p>
              <Link
                href="/signup?next=/accounts"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && (
            <>
              <div className="mt-8 space-y-3">
                {entities.length === 0 && !showForm && (
                  <p className="py-6 text-center text-[14px] text-zinc-500">
                    No accounts yet. Create a personal profile or a company.
                  </p>
                )}

                {entities.map((e) => (
                  <Link
                    key={e.id}
                    href={e.path}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.08] transition hover:ring-white/15"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-base font-semibold text-omniv-gold">
                      {e.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-white">
                        {e.name}
                      </p>
                      <p className="truncate text-[12px] text-zinc-500">
                        <span className="capitalize">{e.type}</span>
                        {e.tagline ? ` · ${e.tagline}` : ""}
                      </p>
                    </div>
                    <span className="text-zinc-600">›</span>
                  </Link>
                ))}
              </div>

              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black"
                >
                  Add account
                </button>
              ) : (
                <form
                  onSubmit={onCreate}
                  className="mt-8 space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]"
                >
                  <p className="text-[13px] font-medium text-white">
                    New account
                  </p>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Type
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PUBLISHER_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`rounded-xl py-2.5 text-[13px] font-medium capitalize ${
                            type === t
                              ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/40"
                              : "text-zinc-400 ring-1 ring-white/10"
                          }`}
                        >
                          {PUBLISHER_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-[12px] text-zinc-400">Name *</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        type === "person"
                          ? "Your name"
                          : type === "company"
                            ? "Company name"
                            : "Name"
                      }
                      className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] text-zinc-400">Tagline</span>
                    <input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="One line about this account"
                      className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] text-zinc-400">Location</span>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, country"
                      className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] text-zinc-400">About</span>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={3}
                      placeholder="Short bio…"
                      className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                    />
                  </label>

                  {error && (
                    <p className="text-[13px] text-red-400">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="h-11 flex-1 rounded-full text-[14px] text-zinc-400 ring-1 ring-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-11 flex-1 rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-60"
                    >
                      {loading ? "Creating…" : "Create"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
