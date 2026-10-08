"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  writeActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import {
  VerifiedBadge,
  isAlwaysVerified,
} from "@/components/discovery/verified-badge";
import { resolveEntityAvatar } from "@/lib/discovery/resolve-avatar";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
  verified?: boolean;
  avatar_url?: string | null;
};

function dedupeEntities(list: EntityRow[]): EntityRow[] {
  const seen = new Set<string>();
  const out: EntityRow[] = [];
  for (const e of list) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  return out;
}

export function IdentitySwitcher({
  onClose,
  compact,
}: {
  onClose?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
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
        setEntities(dedupeEntities(data.entities || []));
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
    router.push("/profile");
  }

  function pickEntity(e: EntityRow) {
    const next: ActiveAccount = {
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
      verified: isAlwaysVerified({
        verified: e.verified,
        slug: e.slug,
        name: e.name,
      }),
      handle: e.slug,
      avatarUrl: resolveEntityAvatar({
        avatarUrl: e.avatar_url,
        slug: e.slug,
        name: e.name,
      }),
    };
    writeActiveAccount(next);
    setActive(next);
    onClose?.();
    router.push(e.path);
  }

  return (
    <div className={compact ? "" : "px-1 py-1"}>
      <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        Personal
      </p>

      <button
        type="button"
        onClick={pickPersonal}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
          !active
            ? "bg-omniv-gold/10 ring-1 ring-omniv-gold/30"
            : "hover:bg-white/[0.04]"
        }`}
      >
        <OmnivAvatar src={avatarUrl} name={displayName} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-white">
            {displayName}
          </p>
          <p className="text-[12px] text-zinc-500">Personal · @{handle}</p>
        </div>
        {!active ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-omniv-gold text-[11px] font-bold text-black">
            ●
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full ring-1 ring-white/20" />
        )}
      </button>

      <p className="mt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        Entities
      </p>

      {entities.map((e) => {
        const isActive = active?.id === e.id;
        const verified = isAlwaysVerified({
          verified: e.verified,
          slug: e.slug,
          name: e.name,
        });
        const src = resolveEntityAvatar({
          avatarUrl: e.avatar_url,
          slug: e.slug,
          name: e.name,
        });
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
            <OmnivAvatar src={src} name={e.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-white">
                <span className="truncate">{e.name}</span>
                {verified && (
                  <VerifiedBadge
                    name={e.name}
                    verifyType={e.type}
                    size={14}
                  />
                )}
              </p>
              <p className="text-[12px] capitalize text-zinc-500">
                {e.type}
                {verified ? " · Verified" : ""}
              </p>
            </div>
            {isActive ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-omniv-gold text-[11px] font-bold text-black">
                ●
              </span>
            ) : (
              <span className="h-5 w-5 rounded-full ring-1 ring-white/20" />
            )}
          </button>
        );
      })}

      {auth && entities.length === 0 && (
        <p className="px-3 py-2 text-[12px] text-zinc-500">
          No entities yet — create a company, brand, artist, or product.
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

      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <Link
          href="/accounts"
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-omniv-gold/5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-omniv-gold/50 text-lg text-omniv-gold">
            +
          </span>
          <span className="text-[14px] font-medium text-omniv-gold">
            Create entity
          </span>
        </Link>

        <Link
          href="/accounts"
          onClick={onClose}
          className="mt-1 block px-3 py-2 text-[13px] text-zinc-500 hover:text-zinc-300"
        >
          Manage identities →
        </Link>
      </div>

      <p className="mt-3 px-3 pb-2 text-[11px] leading-relaxed text-zinc-600">
        Switch identity and everything changes — feed, publications, followers,
        analytics, and settings.
      </p>
    </div>
  );
}
