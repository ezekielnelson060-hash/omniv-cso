"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PUBLICATION_LABELS, type PublicationType } from "@/lib/discovery/types";

export function ProfilePubMenu({
  id,
  slug,
  type,
  title,
}: {
  id: string;
  slug: string;
  type: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label =
    PUBLICATION_LABELS[type as PublicationType]?.toLowerCase() || "publication";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full px-3.5 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.06]";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Manage publication"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-52 origin-top-right overflow-hidden rounded-xl bg-[#141414] py-1 shadow-xl ring-1 ring-white/10"
          role="menu"
        >
          <p className="px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Manage
          </p>
          <Link
            href={`/publish?edit=${encodeURIComponent(id)}`}
            className={item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Edit
          </Link>
          <Link
            href={`/promote?slug=${encodeURIComponent(slug)}`}
            className={item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Promote this {label}
          </Link>
          <Link
            href={`/analytics?publication=${encodeURIComponent(id)}`}
            className={item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            View analytics
          </Link>
          <button
            type="button"
            className={item}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              const url =
                typeof window !== "undefined"
                  ? `${window.location.origin}/p/${slug}`
                  : `/p/${slug}`;
              void navigator.clipboard?.writeText(url);
            }}
          >
            Copy share link
          </button>
        </div>
      )}
    </div>
  );
}
