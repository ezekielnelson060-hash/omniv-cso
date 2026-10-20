"use client";

import Link from "next/link";

/**
 * X / LinkedIn-style prompt: verify to own this identity on Omniv.
 */
export function GetVerifiedCard({
  variant = "full",
  name,
  compact,
}: {
  variant?: "full" | "inline" | "banner";
  name?: string;
  compact?: boolean;
}) {
  const who = name?.trim() || "your identity";

  if (variant === "inline") {
    return (
      <Link
        href="/verify"
        className="inline-flex items-center gap-1.5 rounded-full bg-omniv-gold/15 px-3 py-1.5 text-[12px] font-semibold text-omniv-gold ring-1 ring-omniv-gold/25 transition hover:bg-omniv-gold/25"
      >
        <VerifiedMark size={14} />
        Get verified
      </Link>
    );
  }

  if (variant === "banner" || compact) {
    return (
      <Link
        href="/verify"
        className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-omniv-gold/15 to-transparent px-3.5 py-3 ring-1 ring-omniv-gold/25 transition hover:from-omniv-gold/20"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-omniv-gold">
          <VerifiedMark size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white">Get verified</p>
          <p className="truncate text-[12px] text-zinc-400">
            Own {who} on Omniv — badge explorers trust
          </p>
        </div>
        <span className="shrink-0 text-[12px] font-semibold text-omniv-gold">
          Apply →
        </span>
      </Link>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-omniv-gold/30">
      <div className="bg-gradient-to-br from-omniv-gold/20 via-omniv-gold/5 to-transparent px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-omniv-gold text-black">
            <VerifiedMark size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              Omniv Verification
            </p>
            <h3 className="mt-1 text-[18px] font-semibold leading-snug text-white">
              Get verified. Own your identity.
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
              Like the check on X or LinkedIn — a verified badge tells explorers
              this is the real {who}, not a copy. Protect your name, appear more
              trustworthy, and stand out in discovery.
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-[13px] text-zinc-300">
          {[
            "Badge on your profile and every publication",
            "Proof you own this identity on Omniv",
            "Higher trust in search, feed, and promote",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-omniv-gold">✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/verify"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
        >
          Get verified
        </Link>
        <p className="mt-3 text-center text-[11px] text-zinc-600">
          Apply · pay · Omniv reviews · badge if approved
        </p>
      </div>
    </div>
  );
}

function VerifiedMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2 9.2 3.1 6.1 3 4.5 5.6 2.2 7.2 2.5 10.3 1 12.8l1.5 2.5-.3 3.1 2.3 1.6L6 22l3.1-.1L12 23l2.9-1.1 3.1.1 1.6-2.6 2.3-1.6-.3-3.1L22.9 12l-1.5-2.5.3-3.1-2.3-1.6L17.9 3l-3.1.1L12 2Zm-1.4 13.3-3.2-3.2 1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4-6 6Z" />
    </svg>
  );
}
