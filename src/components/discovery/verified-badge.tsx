"use client";

import { useState } from "react";
import Link from "next/link";
import {
  isAlwaysVerified,
  resolveVerifyCategory,
  type VerifyCategory,
} from "@/lib/discovery/verified";

// Re-export for existing client imports
export { isAlwaysVerified, resolveVerifyCategory };
export type { VerifyCategory };

/**
 * Omniv Verified — classic circle check (readable at small sizes).
 * Color communicates verification category.
 */

const VERIFY_COLOR: Record<VerifyCategory, string> = {
  person: "#3B82F6",
  company: "#C9A227",
  brand: "#A855F7",
  artist: "#EC4899",
  organization: "#14B8A6",
  project: "#F97316",
  media: "#EF4444",
  entity: "#C9A227",
};

const VERIFY_LABEL: Record<VerifyCategory, string> = {
  person: "Verified Person",
  company: "Verified Company",
  brand: "Verified Brand",
  artist: "Verified Artist",
  organization: "Verified Organization",
  project: "Verified Project",
  media: "Verified Publisher",
  entity: "Omniv Verified",
};

function CheckmarkIcon({
  color,
  size = 18,
}: {
  color: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill={color} />
      <path
        d="M7.8 12.2 10.6 15l5.6-6.2"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VerifiedBadge({
  className = "",
  name,
  verifiedAt,
  verifyType = "entity",
  href,
  size = 16,
}: {
  className?: string;
  name?: string;
  verifiedAt?: string | null;
  verifyType?: string;
  href?: string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const category = resolveVerifyCategory(verifyType);
  const color = VERIFY_COLOR[category];
  const label = VERIFY_LABEL[category];

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        aria-label={label}
        title={label}
      >
        <CheckmarkIcon color={color} size={size} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative z-10 w-full max-w-sm rounded-t-3xl bg-[#121212] p-5 ring-1 ring-white/10 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <CheckmarkIcon color={color} size={28} />
              <div>
                <p className="text-[16px] font-semibold text-white">{label}</p>
                {name ? (
                  <p className="text-[13px] text-zinc-400">{name}</p>
                ) : null}
              </div>
            </div>
            {verifiedAt ? (
              <p className="mt-3 text-[12px] text-zinc-500">
                Verified {verifiedAt}
              </p>
            ) : null}
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
              This account is verified on Omniv. The badge color shows the
              verification category.
            </p>
            <div className="mt-5 flex gap-2">
              {href ? (
                <Link
                  href={href}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
                  onClick={() => setOpen(false)}
                >
                  View profile
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 flex-1 rounded-full bg-white/[0.08] text-[14px] font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function GetVerifiedCard({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/verify"
      className={`block rounded-2xl border border-omniv-gold/25 bg-omniv-gold/[0.06] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <p className="text-[13px] font-semibold text-omniv-gold">Get verified</p>
      <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
        Verified accounts get a badge and higher trust in discovery.
      </p>
    </Link>
  );
}
