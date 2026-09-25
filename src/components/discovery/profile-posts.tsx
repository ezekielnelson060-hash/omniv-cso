"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileEngagement } from "@/components/discovery/profile-engagement";

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
    <ul className="space-y-3">
      {pubs.map((p) => (
        <li
          key={p.id}
          className="rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.08]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-[12px] font-bold text-omniv-gold">
              {(p.type || "p").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/p/${p.slug}`} className="block">
                <p className="text-[14px] font-semibold leading-snug text-white">
                  {p.title}
                </p>
                {p.summary && (
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                    {p.summary}
                  </p>
                )}
                <p className="mt-1.5 text-[11px] capitalize text-zinc-600">
                  {p.type}
                  {p.publishedAt ? ` · ${p.publishedAt}` : ""}
                </p>
              </Link>
              <ProfileEngagement slug={p.slug} seedLikes={0} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
