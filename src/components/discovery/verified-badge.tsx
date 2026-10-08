"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Omniv Verified — classic circle check (readable at small sizes).
 * Color communicates verification category.
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

const ALWAYS_VERIFIED_SLUGS = new Set([
  "omniv",
  "omniv-editorial",
  "omniv-media",
  "omniv-media-inc",
]);

const ALWAYS_VERIFIED_NAMES = new Set([
  "omniv",
  "omniv editorial",
  "omniv media",
]);

export function isAlwaysVerified(opts: {
  slug?: string | null;
  name?: string | null;
  verified?: boolean | null;
}): boolean {
  if (opts.verified) return true;
  const slug = (opts.slug || "").toLowerCase().trim();
  if (slug && ALWAYS_VERIFIED_SLUGS.has(slug)) return true;
  if (slug.startsWith("omniv-")) return true;
  const name = (opts.name || "").toLowerCase().trim();
  if (name && ALWAYS_VERIFIED_NAMES.has(name)) return true;
  return false;
}

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
  verifiedAt?: string;
  verifyType?: string;
  href?: string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const category = resolveVerifyCategory(verifyType);
  const color = VERIFY_COLOR[category];
  const label = VERIFY_LABEL[category];

  // Always produce "Mon YYYY" with a real space (e.g. "Sep 2026")
  let verifiedDate: string | null = null;
  if (verifiedAt) {
    try {
      const d = new Date(verifiedAt);
      if (!Number.isNaN(d.getTime())) {
        const month = d.toLocaleDateString("en-US", { month: "short" });
        const year = d.getFullYear();
        verifiedDate = `${month} ${year}`;
      }
    } catch {
      /* ignore */
    }
  }

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
            className="w-full max-w-sm rounded-2xl bg-[#121212] p-6 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0">
                <CheckmarkIcon color={color} size={32} />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-[17px] font-semibold leading-snug text-white">
                  {label}
                </p>
                {name ? (
                  <p className="text-[14px] leading-relaxed text-zinc-300">
                    {`${name} is verified on Omniv.`}
                  </p>
                ) : null}
                {verifiedDate ? (
                  <p className="text-[13px] text-zinc-500">
                    {`Verified ${verifiedDate}`}
                  </p>
                ) : null}
                <p className="pt-1 text-[13px] leading-relaxed text-zinc-500">
                  Verification confirms identity or representation — not an
                  endorsement of content.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2.5">
              {href ? (
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
                >
                  View verification details
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 rounded-full bg-white/[0.06] text-[14px] font-medium text-white"
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
