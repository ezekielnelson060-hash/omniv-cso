"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
};

export function PublishAsPicker({
  value,
  onChange,
  onEntityId,
}: {
  value: string;
  onChange: (name: string) => void;
  onEntityId?: (id: string | null) => void;
}) {
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [auth, setAuth] = useState(false);
  const [mode, setMode] = useState<"pick" | "custom">("custom");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        const list = (data.entities || []) as EntityRow[];
        setEntities(list);
        if (list.length > 0) {
          setMode("pick");
          if (!value) {
            onChange(list[0].name);
            onEntityId?.(list[0].id);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth || entities.length === 0) {
    return (
      <div>
        <input
          required
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onEntityId?.(null);
          }}
          placeholder="Your name, brand, or company"
          className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
        />
        <p className="mt-1.5 text-[12px] text-zinc-600">
          Tip: create accounts under{" "}
          <Link href="/accounts" className="text-omniv-gold hover:underline">
            Your accounts
          </Link>{" "}
          so you can switch who you publish as.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {mode === "pick" ? (
        <select
          value={entities.find((e) => e.name === value)?.id || entities[0]?.id}
          onChange={(e) => {
            const ent = entities.find((x) => x.id === e.target.value);
            if (ent) {
              onChange(ent.name);
              onEntityId?.(ent.id);
            }
          }}
          className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
        >
          {entities.map((e) => (
            <option key={e.id} value={e.id} className="bg-zinc-900">
              {e.name} ({e.type})
            </option>
          ))}
        </select>
      ) : (
        <input
          required
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onEntityId?.(null);
          }}
          placeholder="Custom publisher name"
          className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
        />
      )}
      <div className="flex items-center justify-between text-[12px]">
        <button
          type="button"
          onClick={() => setMode(mode === "pick" ? "custom" : "pick")}
          className="text-zinc-500 hover:text-white"
        >
          {mode === "pick" ? "Use a different name" : "Choose from accounts"}
        </button>
        <Link href="/accounts" className="text-omniv-gold hover:underline">
          Manage accounts
        </Link>
      </div>
      <p className="text-[12px] text-zinc-600">
        This publication will appear on the selected profile.
      </p>
    </div>
  );
}
