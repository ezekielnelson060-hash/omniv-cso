"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  readActiveAccount,
  writeActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  tagline: string;
  location?: string;
  path: string;
  verified?: boolean;
};

type Tab = "entities" | "activity" | "settings";

/** Mockup screen 3 — entity type grid */
const CREATE_TYPES: {
  id: string;
  label: string;
  hint: string;
  icon: string;
}[] = [
  { id: "company", label: "Company", hint: "Business or organization", icon: "▣" },
  { id: "artist", label: "Artist", hint: "Music, art, creator", icon: "♪" },
  { id: "brand", label: "Brand", hint: "Product or lifestyle brand", icon: "◇" },
  { id: "product", label: "Product", hint: "Software or physical product", icon: "⬡" },
  { id: "project", label: "Project", hint: "Initiative or community", icon: "◎" },
  { id: "person", label: "Person", hint: "Personal publisher page", icon: "◉" },
  { id: "event", label: "Event", hint: "Event or experience", icon: "▦" },
  { id: "opportunity", label: "Opportunity", hint: "Funding, roles, calls", icon: "✦" },
];

export default function AccountsPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("entities");
  const [mode, setMode] = useState<"list" | "pick-type" | "form">("list");
  const [type, setType] = useState("company");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
    setActiveId(readActiveAccount()?.id ?? null);
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setAvatarUrl(p.avatarUrl || null);
    } catch {
      /* ignore */
    }
  }, []);

  function switchTo(e: EntityRow) {
    writeActiveAccount({
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
    });
    setActiveId(e.id);
  }

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
      setMode("list");
      setName("");
      setTagline("");
      setLocation("");
      setAbout("");
      if (data.entity) {
        writeActiveAccount({
          id: data.entity.id,
          type: data.entity.type,
          slug: data.entity.slug,
          name: data.entity.name,
          path: data.path || `/e/${data.entity.type}/${data.entity.slug}`,
        });
        setActiveId(data.entity.id);
      }
      await load();
      if (data.path) router.push(data.path);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const typeMeta = CREATE_TYPES.find((t) => t.id === type);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        {/* Dashboard header — mockup 4 */}
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto max-w-lg px-4 py-4 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-lg font-semibold text-omniv-gold ring-2 ring-white/10"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold text-white">
                  {displayName}
                </p>
                <p className="text-[12px] text-zinc-500">Personal Profile</p>
              </div>
              <Link
                href="/accounts/switch"
                className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white"
              >
                Switch
              </Link>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-2">
              {(
                [
                  { id: "entities" as const, label: "Entities" },
                  { id: "activity" as const, label: "Activity" },
                  { id: "settings" as const, label: "Settings" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setMode("list");
                  }}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                    tab === t.id
                      ? "bg-omniv-gold text-black"
                      : "text-zinc-400 ring-1 ring-white/12"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5 md:max-w-2xl md:px-6">
          {auth === false && (
            <div className="rounded-2xl bg-white/[0.03] p-6 text-center ring-1 ring-white/[0.08]">
              <p className="text-[14px] text-zinc-400">
                Sign in to manage entities.
              </p>
              <Link
                href="/signup?next=/accounts"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && tab === "entities" && mode === "list" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">
                  Your Entities{" "}
                  <span className="text-zinc-500">({entities.length})</span>
                </p>
                <button
                  type="button"
                  onClick={() => setMode("pick-type")}
                  className="inline-flex items-center gap-1 rounded-full bg-omniv-gold px-3.5 py-1.5 text-[12px] font-semibold text-black"
                >
                  + Create
                </button>
              </div>

              {entities.length === 0 ? (
                <div className="mt-12 text-center">
                  <p className="text-[15px] text-zinc-400">
                    No entities yet
                  </p>
                  <p className="mt-1 text-[13px] text-zinc-600">
                    Create a company, artist, brand, or project to publish as.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode("pick-type")}
                    className="mt-6 inline-flex h-12 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
                  >
                    Create entity
                  </button>
                </div>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {entities.map((e) => {
                    const isActive = activeId === e.id;
                    return (
                      <li key={e.id}>
                        <div
                          className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${
                            isActive
                              ? "bg-omniv-gold/10 ring-omniv-gold/35"
                              : "bg-white/[0.03] ring-white/[0.08]"
                          }`}
                        >
                          <Link
                            href={e.path}
                            className="flex min-w-0 flex-1 items-center gap-3"
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
                                {e.verified && (
                                  <span className="text-sky-400">
                                    {" "}
                                    · Verified
                                  </span>
                                )}
                                {isActive && (
                                  <span className="text-omniv-gold">
                                    {" "}
                                    · Active
                                  </span>
                                )}
                              </p>
                            </div>
                            <span className="text-zinc-600">›</span>
                          </Link>
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => switchTo(e)}
                              className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white"
                            >
                              Switch
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Link
                href="/accounts/switch"
                className="mt-8 block text-center text-[13px] text-omniv-gold"
              >
                Full switch screen →
              </Link>
            </>
          )}

          {/* Pick type — mockup 3 */}
          {auth && tab === "entities" && mode === "pick-type" && (
            <div>
              <button
                type="button"
                onClick={() => setMode("list")}
                className="mb-4 text-[13px] text-zinc-500"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-white">
                Create an entity
              </h1>
              <p className="mt-1 text-[13px] text-zinc-500">
                Choose what you want to create.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {CREATE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id);
                      setMode("form");
                    }}
                    className="flex flex-col items-start gap-2 rounded-2xl bg-white/[0.03] p-4 text-left ring-1 ring-white/[0.08] transition hover:ring-omniv-gold/40"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg text-omniv-gold">
                      {t.icon}
                    </span>
                    <span className="text-[14px] font-semibold text-white">
                      {t.label}
                    </span>
                    <span className="text-[11px] leading-snug text-zinc-500">
                      {t.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          {auth && tab === "entities" && mode === "form" && (
            <form onSubmit={onCreate} className="space-y-4">
              <button
                type="button"
                onClick={() => setMode("pick-type")}
                className="text-[13px] text-zinc-500"
              >
                ← Change type
              </button>
              <h1 className="text-xl font-semibold text-white">
                New {typeMeta?.label || type}
              </h1>
              <label className="block">
                <span className="text-[12px] text-zinc-400">Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-zinc-400">Tagline</span>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="One line about this entity"
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
              {error && <p className="text-[13px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create entity"}
              </button>
            </form>
          )}

          {auth && tab === "activity" && (
            <div className="py-8 text-center">
              <p className="text-[14px] text-zinc-500">
                Entity activity will show here.
              </p>
              <Link
                href="/activity"
                className="mt-4 inline-block text-[13px] text-omniv-gold"
              >
                Open network activity →
              </Link>
            </div>
          )}

          {auth && tab === "settings" && (
            <div className="space-y-3">
              <Link
                href="/profile"
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.08]"
              >
                <span className="text-[14px] text-white">Edit personal profile</span>
                <span className="text-zinc-600">›</span>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.08]"
              >
                <span className="text-[14px] text-omniv-gold">Upgrade to Pro</span>
                <span className="text-zinc-600">›</span>
              </Link>
              <Link
                href="/verify"
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.08]"
              >
                <span className="text-[14px] text-white">Get verified</span>
                <span className="text-zinc-600">›</span>
              </Link>
              <Link
                href="/analytics"
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.08]"
              >
                <span className="text-[14px] text-white">Analytics</span>
                <span className="text-zinc-600">›</span>
              </Link>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
