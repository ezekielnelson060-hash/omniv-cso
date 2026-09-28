"use client";

import { useState } from "react";
import Link from "next/link";

type BadgeKind = "profile" | "entity" | "company";

function resolveKind(verifyType?: string): BadgeKind {
  const t = (verifyType || "").toLowerCase();
  if (
    t === "personal" ||
    t === "person" ||
    t === "profile" ||
    t === "individual"
  ) {
    return "profile";
  }
  if (
    t === "company" ||
    t === "organization" ||
    t === "org" ||
    t === "brand"
  ) {
    return "company";
  }
  return "entity";
}

/** Profile = blue · Entity = gold · Company = emerald */
const BADGE_FILL: Record<BadgeKind, string> = {
  profile: "#3b82f6",
  entity: "#C9A227",
  company: "#10b981",
};

const BADGE_LABEL: Record<BadgeKind, string> = {
  profile: "person",
  entity: "entity",
  company: "organization",
};

function BadgeIcon({ kind, size = 18 }: { kind: BadgeKind; size?: number }) {
  const fill = BADGE_FILL[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5c-4.8 0-8.5 3.2-8.5 7.6 0 5.1 4.2 9.4 8.5 11.4 4.3-2 8.5-6.3 8.5-11.4C20.5 5.7 16.8 2.5 12 2.5z"
        fill={fill}
      />
      <path
        d="M8.2 12.2 10.6 14.6 15.8 9.2"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Verified check — color by identity type */
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
  href?: string;
}) {
  const [open, setOpen] = useState(false);
  const kind = resolveKind(verifyType);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        title={`Verified ${BADGE_LABEL[kind]}`}
        aria-label={`Verified ${BADGE_LABEL[kind]}`}
      >
        <BadgeIcon kind={kind} size={18} />
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
              <BadgeIcon kind={kind} size={22} />
              <p className="text-[16px] font-semibold text-white">
                Verified by Omniv
              </p>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
              Omniv has verified the identity of this {BADGE_LABEL[kind]}
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

/** Apply for verification — not pay-for-badge */
export function GetVerifiedCard() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-white/[0.1]">
      <div className="bg-gradient-to-br from-sky-500/20 via-omniv-gold/10 to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500/20">
            <BadgeIcon kind="entity" size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-white">Get verified</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
              Apply for Omniv Verification. We review your identity or entity and
              supporting evidence. If approved, this account receives a verified
              badge — authenticity, not endorsement.
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
