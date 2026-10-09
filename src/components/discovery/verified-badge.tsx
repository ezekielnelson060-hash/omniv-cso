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
        data-inline
        className={`inline-control inline-flex h-auto min-h-0 shrink-0 items-center justify-center p-0 ${className}`}
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
                <p className="text-[15px] font-semibold text-white">{label}</p>
                {name ? (
                  <p className="mt-0.5 text-[13px] text-zinc-400">{name}</p>
                ) : null}
                {verifiedAt ? (
                  <p className="mt-1 text-[11px] text-zinc-600">
                    Verified {verifiedAt}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
              This account has been verified on Omniv. The checkmark color shows
              the type of verified presence.
            </p>
            {href ? (
              <Link
                href={href}
                className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black"
                onClick={() => setOpen(false)}
              >
                View profile
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-full py-2.5 text-[13px] text-zinc-400"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
