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

/** Upgrade card shown on an unverified public entity page. */
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
              Verified Publisher
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
              Pro includes an ongoing verified badge for this entity, higher
              visibility, more trust, and access to premium features.
            </p>
            <Link
              href="/verify"
              className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
            >
              View Pro plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
