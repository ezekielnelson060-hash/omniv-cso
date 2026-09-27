"use client";

import { useState } from "react";
import Link from "next/link";

/** Verified check — opens trust sheet; optional href to public verification page */
export function VerifiedBadge({
  className = "",
  name,
  verifiedAt,
  verifyType = "Entity",
  href,
}: {
  className?: string;
  name?: string;
  verifiedAt?: string;
  verifyType?: string;
  /** Public verification page e.g. /e/company/omniv/verified */
  href?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center ${className}`}
        title="Verified by Omniv"
        aria-label="Verified"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#3b82f6" />
          <path
            d="M8 12.5 10.5 15 16 9.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#121212] p-5 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                <path
                  d="M8 12.5 10.5 15 16 9.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-[16px] font-semibold text-white">
                Verified by Omniv
              </p>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
              Omniv has verified the identity of this{" "}
              {verifyType.toLowerCase()}
              {name ? ` (${name})` : ""} and confirmed that this account is
              associated with it. Verification establishes authenticity — not
              endorsement.
            </p>
            {verifiedAt && (
              <p className="mt-3 text-[12px] text-zinc-500">
                Verified:{" "}
                {(() => {
                  const d = Date.parse(verifiedAt);
                  return Number.isFinite(d)
                    ? new Date(d).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : verifiedAt;
                })()}
              </p>
            )}
            <div className="mt-5 flex flex-col gap-2">
              {href && (
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
                >
                  View verification details
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 rounded-full bg-white/[0.06] text-[14px] font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
