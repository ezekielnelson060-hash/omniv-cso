"use client";

import { useEffect, useState } from "react";

/** Artist-first mark for public pages. Loads photo async so main page stays fast. */
export function ArtistAvatar({
  name,
  src,
  slug,
  size = 56,
}: {
  name: string;
  src?: string | null;
  /** When set, fetches /api/roster/public/avatar if src missing */
  slug?: string | null;
  size?: number;
}) {
  const [loaded, setLoaded] = useState<string | null>(src || null);

  useEffect(() => {
    if (src) {
      setLoaded(src);
      return;
    }
    if (!slug) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/roster/public/avatar?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { avatarUrl?: string | null };
        if (!cancelled && data.avatarUrl) setLoaded(data.avatarUrl);
      } catch {
        /* soft */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, slug]);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "•";

  if (loaded) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={loaded}
        alt={name}
        width={size}
        height={size}
        className="rounded-2xl border border-white/10 object-cover shadow-lg"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-white/5 text-[#d4af37]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="text-sm font-semibold tracking-tight">{initials}</span>
    </div>
  );
}
