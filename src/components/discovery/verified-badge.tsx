"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Omniv Verified — mature shield check (not a plain circle).
 * Color communicates verification category.
 *
 * Person → Blue · Company → Gold · Brand → Purple · Artist → Pink
 * Organization → Teal · Project → Orange · Media → Red
 */
export type VerifyCategory =
  | "person"
  | "company"
  | "brand"
  | "artist"
  | "organization"
  | "project"
  | "media"
  | "entity";

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

export function resolveVerifyCategory(verifyType?: string): VerifyCategory {
  const t = (verifyType || "").toLowerCase().trim();
  if (
    t === "personal" ||
    t === "person" ||
    t === "profile" ||
    t === "individual"
  )
    return "person";
  if (t === "company") return "company";
  if (t === "brand") return "brand";
  if (t === "artist") return "artist";
  if (t === "organization" || t === "org") return "organization";
  if (t === "project") return "project";
  if (t === "media" || t === "publisher") return "media";
  return "entity";
}

/** Shield + check — not a flat circle */
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
      <path
        d="M12 2.2 4.8 5.4v5.3c0 5.2 3.4 9.9 7.2 11.1 3.8-1.2 7.2-5.9 7.2-11.1V5.4L12 2.2z"
        fill={color}
      />
      <path
        d="M8.2 12.1 10.7 14.6 15.8 9.4"
        stroke="#0a0a0a"
        strokeWidth="2.1"
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
  size = 18,
}: {
  className?: string;
  name?: string;
  verifiedAt?: string;
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
        className={`inline-flex shrink-0 items-center justify-center align-middle ${className}`}
        aria-label={label}
        title={label}
      >
        <CheckmarkIcon color={color} size={size} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#121212] p-5 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <CheckmarkIcon color={color} size={28} />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-white">{label}</p>
                {name && (
                  <p className="mt-1 text-[13px] text-zinc-400">
                    {name} is verified on Omniv.
                  </p>
                )}
                {verifiedAt && (
                  <p className="mt-2 text-[12px] text-zinc-500">
                    Verified{" "}
                    {new Date(verifiedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
                  Verification confirms identity or representation — not an
                  endorsement of content.
                </p>
              </div>
            </div>
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

export function GetVerifiedCard({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/verify"
        className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.08] transition hover:bg-white/[0.06]"
      >
        <CheckmarkIcon color="#C9A227" size={22} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white">Get Verified</p>
          <p className="text-[12px] text-zinc-500">
            Build trust and stand out across Omniv
          </p>
        </div>
        <span className="text-zinc-500">→</span>
      </Link>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-white/[0.1]">
      <div className="bg-gradient-to-br from-sky-500/15 via-omniv-gold/10 to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
            <CheckmarkIcon color="#C9A227" size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-white">Get Verified</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
              Omniv verifies that you represent the person, company, brand,
              artist, organization, or project claimed. Authenticity — not
              endorsement.
            </p>
            <Link
              href="/verify"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
            >
              Get Verified
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
