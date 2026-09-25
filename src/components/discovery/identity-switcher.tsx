"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  writeActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
  verified?: boolean;
  avatar_url?: string | null;
};

/**
 * Identity switcher panel — personal + all owned entities.
 * Each entity is an independent public identity.
 */
export function IdentitySwitcher({
  onClose,
  compact,
}: {
  onClose?: () => void;
  compact?: boolean;
}) {
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [auth, setAuth] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setHandle(p.handle || "you");
      setAvatarUrl(p.avatarUrl || null);
      setActive(readActiveAccount());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        setEntities(data.entities || []);
      } catch {
        if (!cancelled) setAuth(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function pickPersonal() {
    writeActiveAccount(null);
    setActive(null);
    onClose?.();
  }

  function pickEntity(e: EntityRow) {
    const next: ActiveAccount = {
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
      verified: e.verified,
      handle: e.slug,
      avatarUrl: e.avatar_url,
    };
    writeActiveAccount(next);
    setActive(next);
    onClose?.();
  }

  return (
    <div className={compact ? "" : "p-1"}>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        Your identities
      </p>

      {/* Personal */}
      <button
        type="button"
        onClick={pickPersonal}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
          !active
            ? "bg-omniv-gold/10 ring-1 ring-omniv-gold/30"
            : "hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-white">
            {displayName}
          </p>
          <p className="text-[12px] text-zinc-500">
            Personal · @{handle}
          </p>
        </div>
        {!active && (
          <span className="h-2.5 w-2.5 rounded-full bg-omniv-gold" />
        )}
      </button>

      <p className="mt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        Publish as
      </p>

      {entities.map((e) => {
        const isActive = active?.id === e.id;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => pickEntity(e)}
            className={`mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
              isActive
                ? "bg-omniv-gold/10 ring-1 ring-omniv-gold/30"
                : "hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
              {e.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                e.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-white">
                {e.name}
                {e.verified && (
                  <span className="inline-flex text-sky-400" title="Verified">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.4 2.4L18 3l.6 3.6L22 9l-2.4 2.4L21 15l-3.6.6L15 19l-2.4-2.4L9 19l-.6-3.6L5 15l2.4-2.4L5 9l3.6-.6L9 5l2.4 2.4L12 2z" />
                    </svg>
                  </span>
                )}
              </p>
              <p className="text-[12px] capitalize text-zinc-500">
                {e.type}
                {e.verified ? " · Verified" : ""} · @{e.slug}
              </p>
            </div>
            {isActive && (
              <span className="h-2.5 w-2.5 rounded-full bg-omniv-gold" />
            )}
          </button>
        );
      })}

      {auth && entities.length === 0 && (
        <p className="px-3 py-2 text-[12px] text-zinc-500">
          No entities yet — create one to publish as a company, brand, or artist.
        </p>
      )}

      {!auth && (
        <Link
          href="/signup?next=/accounts"
          onClick={onClose}
          className="mt-2 block px-3 py-2 text-[13px] text-omniv-gold"
        >
          Sign in to manage identities →
        </Link>
      )}

      <Link
        href="/accounts"
        onClick={onClose}
        className="mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 px-3 py-2.5 hover:border-omniv-gold/40"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-omniv-gold">
          +
        </span>
        <span className="text-[14px] font-medium text-omniv-gold">
          Create new entity
        </span>
      </Link>

      <Link
        href="/accounts"
        onClick={onClose}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 hover:bg-white/[0.04] hover:text-white"
      >
        <span className="flex h-10 w-10 items-center justify-center text-[15px]">
          ⚙
        </span>
        <span className="text-[14px]">Manage identities</span>
      </Link>

      <p className="mt-4 px-3 text-[11px] leading-relaxed text-zinc-600">
        One account. Multiple identities. Each with its own audience, activity,
        and analytics.
      </p>
    </div>
  );
}
