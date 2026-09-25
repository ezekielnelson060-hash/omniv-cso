import Link from "next/link";

/** Blue check — only when entity.verified (Pro) */
export function VerifiedBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      title="Verified Publisher"
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
    </span>
  );
}

/** CTA for non-verified entity owners — Pro */
export function GetVerifiedCard() {
  return (
    <div className="mt-6 rounded-2xl bg-omniv-gold/10 p-4 ring-1 ring-omniv-gold/30">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🛡</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white">
            Verified Publisher
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
            Verified accounts get higher visibility, more trust, and access to
            Pro features. Available on Omniv Pro.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex h-10 items-center rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black"
          >
            Get Verified
          </Link>
        </div>
      </div>
    </div>
  );
}
