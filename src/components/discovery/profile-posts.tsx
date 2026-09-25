"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileEngagement } from "@/components/discovery/profile-engagement";
import { readProfile } from "@/lib/discovery/local-profile";

type LivePub = {
  id: string;
  type: string;
  slug: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  publisherName?: string;
  coverUrl?: string;
};

export function ProfilePosts() {
  const [pubs, setPubs] = useState<LivePub[] | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("You");

  useEffect(() => {
    const p = readProfile();
    setAvatar(p.avatarUrl || null);
    setName(p.displayName || "You");

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
      <div className="rounded-2xl bg-white/[0.02] p-6 text-center ring-1 ring-white/[0.06]">
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
    <ul className="divide-y divide-white/[0.06]">
      {pubs.map((p) => {
        const who = p.publisherName || name;
        return (
          <li key={p.id} className="py-4 first:pt-1">
            <div className="flex gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-omniv-gold/20 ring-1 ring-white/10">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-omniv-gold">
                    {who.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate text-[14px] font-semibold text-white">
                    {who}
                  </span>
                  <span className="shrink-0 text-[12px] capitalize text-zinc-600">
                    · {p.type}
                    {p.publishedAt ? ` · ${p.publishedAt}` : ""}
                  </span>
                </div>
                <Link href={`/p/${p.slug}`} className="mt-1 block">
                  <p className="text-[15px] font-medium leading-snug text-white">
                    {p.title}
                  </p>
                  {p.summary && (
                    <p className="mt-1 line-clamp-3 text-[14px] leading-relaxed text-zinc-400">
                      {p.summary}
                    </p>
                  )}
                  {p.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverUrl}
                      alt=""
                      className="mt-3 max-h-48 w-full rounded-2xl object-cover ring-1 ring-white/[0.08]"
                    />
                  )}
                </Link>
                <div className="mt-2">
                  <ProfileEngagement slug={p.slug} seedLikes={0} />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
