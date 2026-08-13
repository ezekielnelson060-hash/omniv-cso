"use client";

/** Artist-first mark for public pages (Fan Gate, tip, etc.). */
export function ArtistAvatar({
  name,
  src,
  size = 56,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "•";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-2xl border border-omniv-border object-cover shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-omniv-gold/30 bg-omniv-elevated text-omniv-gold"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="text-sm font-semibold tracking-tight">{initials}</span>
    </div>
  );
}
