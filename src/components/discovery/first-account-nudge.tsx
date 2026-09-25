"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Soft prompt when user has no Person/Company accounts yet */
export function FirstAccountNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.entities) && data.entities.length === 0) {
          setShow(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <div className="mt-5 rounded-2xl bg-omniv-gold/10 p-4 ring-1 ring-omniv-gold/30">
      <p className="text-[14px] font-semibold text-white">
        Create your public profile
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
        Add a Person account so others can follow you and everything you publish
        has a home.
      </p>
      <Link
        href="/accounts"
        className="mt-3 inline-flex h-10 items-center rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black"
      >
        Set up account
      </Link>
    </div>
  );
}
