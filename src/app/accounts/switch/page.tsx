"use client";

import { useEffect, useMemo, useState } from "react";
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
  tagline?: string;
  path: string;
  verified?: boolean;
};

/** Mockup screen 6 — Switch Between Entities */
export default function SwitchEntityPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [displayName, setDisplayName] = useState("You");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(readActiveAccount()?.id ?? null);
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setAvatarUrl(p.avatarUrl || null);
    } catch {
      /* ignore */
    }
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        setAuth(Boolean(data.auth));
        setEntities(data.entities || []);
      } catch {
        setAuth(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entities;
    return entities.filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.type.toLowerCase().includes(needle) ||
        (e.tagline || "").toLowerCase().includes(needle)
    );
  }, [entities, q]);

  function pickPersonal() {
    writeActiveAccount(null);
    setActiveId(null);
    router.push("/profile");
  }

  function pickEntity(e: EntityRow) {
    writeActiveAccount({
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
    });
    setActiveId(e.id);
    router.push(e.path);
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl md:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Back"
            >
              ←
            </button>
            <h1 className="text-[17px] font-semibold text-white">
              Switch entity
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-2 md:max-w-2xl md:px-6">
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your entities…"
              className="h-11 w-full rounded-full bg-white/[0.05] pl-10 pr-4 text-[14px] text-white outline-none ring-1 ring-white/[0.1] placeholder:text-zinc-600 focus:ring-omniv-gold/40"
            />
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              ⌕
            </span>
          </div>

          {auth === false && (
            <div className="mt-10 text-center">
              <p className="text-zinc-500">Sign in to switch entities.</p>
              <Link
                href="/signup?next=/accounts/switch"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && (
            <ul className="mt-5 space-y-2">
              {/* Personal always first */}
              <li>
                <button
                  type="button"
                  onClick={pickPersonal}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 ${
                    !activeId
                      ? "bg-omniv-gold/10 ring-omniv-gold/35"
                      : "bg-white/[0.03] ring-white/[0.08]"
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/25 text-base font-semibold text-omniv-gold">
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
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="text-[12px] text-zinc-500">Personal profile</p>
                  </div>
                  {!activeId && (
                    <span className="text-omniv-gold">✓</span>
                  )}
                </button>
              </li>

              {filtered.map((e) => {
                const isActive = activeId === e.id;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => pickEntity(e)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 ${
                        isActive
                          ? "bg-omniv-gold/10 ring-omniv-gold/35"
                          : "bg-white/[0.03] ring-white/[0.08]"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-white">
                        {e.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">
                          {e.name}
                          {e.verified && (
                            <span className="ml-1.5 text-[11px] text-sky-400">
                              Verified
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[12px] capitalize text-zinc-500">
                          {e.type}
                          {e.tagline ? ` · ${e.tagline}` : ""}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-omniv-gold">✓</span>
                      )}
                    </button>
                  </li>
                );
              })}

              {filtered.length === 0 && entities.length > 0 && (
                <p className="py-8 text-center text-[13px] text-zinc-500">
                  No matches for “{q}”
                </p>
              )}
            </ul>
          )}

          {auth && (
            <Link
              href="/accounts"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-omniv-gold/40 p-3.5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-omniv-gold">
                +
              </span>
              <div>
                <p className="text-[14px] font-semibold text-omniv-gold">
                  Create new entity
                </p>
                <p className="text-[12px] text-zinc-500">
                  Company, artist, brand, project…
                </p>
              </div>
            </Link>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
