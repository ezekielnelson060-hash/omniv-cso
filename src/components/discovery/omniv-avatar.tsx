"use client";

/**
 * Omniv-branded avatar.
 * Real image when available, otherwise a premium dark + gold orbital fallback
 * that never looks like a plain letter placeholder.
 */
export function OmnivAvatar({
  src,
  name,
  size = 40,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const style = { width: size, height: size } as const;

  if (src) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-omniv-gold/15 ${className}`}
        style={style}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fall back to branded mark if the image 404s
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) parent.dataset.fallback = "1";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        ...style,
        background:
          "radial-gradient(circle at 35% 30%, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0.08) 45%, #0a0a0a 100%)",
        boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.25)",
      }}
      aria-hidden
    >
      {/* Subtle orbital ring */}
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 40 40"
        fill="none"
      >
        <ellipse
          cx="20"
          cy="20"
          rx="15"
          ry="6"
          stroke="#D4AF37"
          strokeWidth="0.8"
          transform="rotate(-25 20 20)"
        />
        <circle cx="20" cy="20" r="2.2" fill="#D4AF37" opacity="0.9" />
      </svg>
      <span
        className="relative z-10 font-semibold tracking-tight text-omniv-gold"
        style={{ fontSize: Math.max(11, size * 0.38) }}
      >
        {initial}
      </span>
    </div>
  );
}
