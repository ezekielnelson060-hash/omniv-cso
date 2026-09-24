"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LivePub = {
  id: string;
  type: string;
  slug: string;
  title: string;
  summary?: string;
  publishedAt?: string;
};

export function ProfilePosts() {
  const [pubs, setPubs] = useState<LivePub[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/discovery/publications/list?owner=me&limit=20"
        );
        const data = await res.json();
        if (cancelled) return;
        setPubs(Array.isArray(data.publications) ? data.publications : []);
      } catch {
        if (!cancelled) setPubs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (pubs === null) {
    return (
      <p className="py-8 text-center text-[14px] text-zinc-600">Loading…</p>
    );
  }

  if (pubs.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] p-5 text-center ring-1 ring-white/[0.06]">
        <p className="text-[14px] text-zinc-400">You haven't published yet.</p>
        <Link
          href="/publish"
          className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
        >
          Publish something
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {pubs.map((p) => (
        <li key={p.id}>
          <Link
            href={`/p/${p.slug}`}
            className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.08] transition hover:ring-white/15"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15 text-[10px] font-bold uppercase text-omniv-gold">
              {(p.type || "post").slice(0, 3)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-white">
                {p.title}
              </p>
              <p className="text-[11px] capitalize text-zinc-500">
                {p.type}
                {p.publishedAt ? ` · ${p.publishedAt}` : ""}
              </p>
            </div>
            <span className="text-zinc-600">›</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
