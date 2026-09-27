"use client";

import { useState } from "react";
import Link from "next/link";

/** Verified check — opens trust sheet on click */
export function VerifiedBadge({
  className = "",
  name,
  verifiedAt,
  verifyType = "Entity",
}: {
  className?: string;
  name?: string;
  verifiedAt?: string;
  verifyType?: string;
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
                Verified: {verifiedAt}
              </p>
            )}
            <p className="mt-1 text-[12px] text-zinc-500">
              Verification type: {verifyType}
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href="/verify"
                className="flex-1 rounded-full bg-white/[0.06] py-2.5 text-center text-[13px] font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Learn more
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-omniv-gold py-2.5 text-[13px] font-semibold text-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Apply for verification — not pay-for-badge */
export function GetVerifiedCard() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-white/[0.1]">
      <div className="bg-gradient-to-br from-sky-500/20 via-omniv-gold/10 to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 2.4L18 3l.6 3.6L22 9l-2.4 2.4L21 15l-3.6.6L15 19l-2.4-2.4L9 19l-.6-3.6L5 15l2.4-2.4L5 9l3.6-.6L9 5l2.4 2.4L12 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-white">
              Get verified
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
              Apply for Omniv Verification. We review your identity or entity
              and supporting evidence. If approved, this account receives a
              verified badge — authenticity, not endorsement.
            </p>
            <Link
              href="/verify"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
            >
              Apply for verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
