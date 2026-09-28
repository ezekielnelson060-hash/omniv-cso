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

/** Switch identity — only entities owned by the signed-in user */
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
        const list = Array.isArray(data.entities) ? data.entities : [];
        setEntities(list);
        // Drop stale identity from another session/account
        const active = readActiveAccount();
        if (active?.id && !list.some((e: EntityRow) => e.id === active.id)) {
          writeActiveAccount(null);
          setActiveId(null);
        }
      } catch {
        setAuth(false);
        setEntities([]);
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
      <div className="min-h-dvh overflow-x-hidden bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-zinc-400"
              aria-label="Back"
            >
              ←
            </button>
            <h1 className="text-[17px] font-semibold text-white">
              Switch entity
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
          <div className="relative mb-4">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              ⌕
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your entities…"
              className="h-12 w-full rounded-full bg-white/[0.04] pl-10 pr-4 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
            />
          </div>

          {auth === false && (
            <div className="rounded-2xl bg-white/[0.03] px-5 py-10 text-center ring-1 ring-white/[0.06]">
              <p className="text-[15px] font-medium text-white">Sign in</p>
              <p className="mt-2 text-[13px] text-zinc-500">
                Your entities only appear on the account that created them.
              </p>
              <Link
                href="/login?next=/accounts/switch"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && (
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={pickPersonal}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition ${
                    !activeId
                      ? "bg-omniv-gold/10 ring-omniv-gold/40"
                      : "bg-white/[0.03] ring-white/[0.06]"
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[15px] font-semibold text-white">
                        {(displayName || "Y").slice(0, 1)}
                      </span>
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
                const initial = (e.name || "?").slice(0, 1).toUpperCase();
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => pickEntity(e)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition ${
                        isActive
                          ? "bg-omniv-gold/10 ring-omniv-gold/40"
                          : "bg-white/[0.03] ring-white/[0.06]"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[15px] font-semibold text-white">
                        {initial}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">
                          {e.name}
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

              {auth && entities.length === 0 && (
                <p className="py-6 text-center text-[13px] text-zinc-500">
                  No entities on this account yet.
                </p>
              )}

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
