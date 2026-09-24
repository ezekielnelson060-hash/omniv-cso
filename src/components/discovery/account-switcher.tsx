"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
};

export function AccountSwitcher({
  compact = false,
  onPicked,
}: {
  compact?: boolean;
  onPicked?: (a: ActiveAccount) => void;
}) {
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setActive(readActiveAccount());
    const unsub = onAccountSwitch((a) => setActive(a));
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        const list = (data.entities || []) as EntityRow[];
        setEntities(list);
        // auto-select first if none
        const current = readActiveAccount();
        if (!current && list.length > 0) {
          const first: ActiveAccount = {
            id: list[0].id,
            type: list[0].type,
            slug: list[0].slug,
            name: list[0].name,
            path: list[0].path,
          };
          writeActiveAccount(first);
          setActive(first);
        } else if (current && list.length) {
          // refresh name if changed
          const match = list.find((e) => e.id === current.id);
          if (match) {
            const refreshed: ActiveAccount = {
              id: match.id,
              type: match.type,
              slug: match.slug,
              name: match.name,
              path: match.path,
            };
            writeActiveAccount(refreshed);
            setActive(refreshed);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  function pick(e: EntityRow) {
    const a: ActiveAccount = {
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
    };
    writeActiveAccount(a);
    setActive(a);
    setOpen(false);
    onPicked?.(a);
  }

  if (!auth) {
    return (
      <Link
        href="/signup?next=/accounts"
        className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 text-[13px] text-zinc-400 ring-1 ring-white/[0.08]"
      >
        Sign in to choose account
      </Link>
    );
  }

  if (entities.length === 0) {
    return (
      <Link
        href="/accounts"
        className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.08]"
      >
        <span className="text-[13px] text-zinc-400">Create an account first</span>
        <span className="text-omniv-gold text-[12px]">Add →</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] transition hover:ring-white/20 ${
          compact ? "px-3 py-2" : "px-3.5 py-3"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-[13px] font-semibold text-omniv-gold">
          {(active?.name || entities[0].name).charAt(0)}
        </span>
        <div className="min-w-0 flex-1 text-left">
          {!compact && (
            <p className="text-[11px] text-zinc-500">Publishing as</p>
          )}
          <p className="truncate text-[14px] font-medium text-white">
            {active?.name || entities[0].name}
          </p>
        </div>
        <span className="text-zinc-500">▾</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-[#141414] shadow-2xl ring-1 ring-white/15">
            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Switch account
            </p>
            <ul className="max-h-64 overflow-y-auto py-1">
              {entities.map((e) => {
                const isActive = active?.id === e.id;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => pick(e)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5 ${
                        isActive ? "bg-omniv-gold/10" : ""
                      }`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-omniv-gold/15 text-[13px] font-semibold text-omniv-gold">
                        {e.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-white">
                          {e.name}
                        </p>
                        <p className="text-[11px] capitalize text-zinc-500">
                          {e.type}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-omniv-gold text-[12px]">✓</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/accounts"
              className="block border-t border-white/10 px-4 py-3 text-[13px] text-omniv-gold hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              Manage accounts →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
