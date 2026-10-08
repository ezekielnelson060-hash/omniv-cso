"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readActiveAccount,
  writeActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";
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
    const key = e.id || `${e.type}:${e.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // also skip duplicate slug+type
    const slugKey = `${e.type}:${e.slug}`;
    if (seen.has(slugKey) && e.id) continue;
    seen.add(slugKey);
    out.push(e);
  }
  return out;
}

/**
 * Personal profile ≠ entity accounts.
 * Switch like Instagram / X. null active = personal.
 */
export function AccountSwitcher({
  onClose,
}: {
  onClose?: () => void;
  compact?: boolean;
  onPicked?: (a: ActiveAccount) => void;
}) {
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const p = readProfile();
    setDisplayName(p.displayName || "You");
    setHandle(p.handle || "you");
    setAvatarUrl(p.avatarUrl || null);
    setActive(readActiveAccount());

    const unsub = onAccountSwitch((a) => setActive(a));

    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        setAuth(Boolean(data.auth));
        setEntities(dedupeEntities(data.entities || []));
      } catch {
        setAuth(false);
      }
    })();

    return unsub;
  }, []);

  function switchPersonal() {
    writeActiveAccount(null);
    setActive(null);
    onClose?.();
  }

  function switchEntity(e: EntityRow) {
    const verified = isAlwaysVerified({
      verified: e.verified,
      slug: e.slug,
      name: e.name,
    });
    const a: ActiveAccount = {
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
      verified,
      handle: e.slug,
      avatarUrl: resolveEntityAvatar({
        avatarUrl: e.avatar_url,
        slug: e.slug,
        name: e.name,
      }),
    };
    writeActiveAccount(a);
    setActive(a);
    onClose?.();
  }

  const personalActive = !active;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={switchPersonal}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
          personalActive
            ? "bg-omniv-gold/15 ring-1 ring-omniv-gold/30"
            : "hover:bg-white/5"
        }`}
      >
        <OmnivAvatar src={avatarUrl} name={displayName} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-white">
            {displayName}
          </p>
          <p className="text-[12px] text-zinc-500">Personal · @{handle}</p>
        </div>
        {personalActive && <span className="text-omniv-gold">✓</span>}
      </button>

      <p className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
        Publish as
      </p>

      {entities.map((e) => {
        const isActive = active?.id === e.id;
        const showVerified = isAlwaysVerified({
          verified: e.verified,
          slug: e.slug,
          name: e.name,
        });
        const av = resolveEntityAvatar({
          avatarUrl: e.avatar_url,
          slug: e.slug,
          name: e.name,
        });
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => switchEntity(e)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
              isActive
                ? "bg-omniv-gold/15 ring-1 ring-omniv-gold/30"
                : "hover:bg-white/5"
            }`}
          >
            <OmnivAvatar src={av} name={e.name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-white">
                <span className="truncate">{e.name}</span>
                {showVerified && (
                  <VerifiedBadge
                    name={e.name}
                    verifyType={e.type}
                    size={14}
                  />
                )}
              </p>
              <p className="text-[12px] capitalize text-zinc-500">
                {e.type}
                {showVerified ? " · Verified" : ""}
              </p>
            </div>
            {isActive && <span className="text-omniv-gold">✓</span>}
          </button>
        );
      })}

      {auth && entities.length === 0 && (
        <p className="px-3 py-2 text-[12px] text-zinc-500">
          No entities yet. Create one to publish as a brand or company.
        </p>
      )}

      {!auth && (
        <Link
          href="/signup?next=/accounts"
          onClick={onClose}
          className="block px-3 py-2 text-[13px] text-omniv-gold"
        >
          Sign in to create entities →
        </Link>
      )}

      <Link
        href="/accounts"
        onClick={onClose}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-omniv-gold/50 text-lg text-omniv-gold">
          +
        </div>
        <div>
          <p className="text-[14px] font-semibold text-omniv-gold">
            Create entity
          </p>
          <p className="text-[12px] text-zinc-500">
            Company, artist, brand, project…
          </p>
        </div>
      </Link>
    </div>
  );
}

export function ActiveAccountChip() {
  const [active, setActive] = useState<ActiveAccount | null>(null);

  useEffect(() => {
    setActive(readActiveAccount());
    return onAccountSwitch((a) => setActive(a));
  }, []);

  if (!active) return null;

  return (
    <Link
      href="/accounts"
      className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-full bg-omniv-gold/15 px-2.5 py-1 text-[11px] font-medium text-omniv-gold"
    >
      <span className="truncate">As {active.name}</span>
    </Link>
  );
}
