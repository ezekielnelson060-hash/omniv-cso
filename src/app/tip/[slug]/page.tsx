"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Tip-only URLs redirect into the full artist page (tip module on the same page).
 * Keeps one bio experience — not a second thin product.
 */
export default function TipPage() {
  const params = useParams();
  const slug = String(params.slug || "").toLowerCase();

  useEffect(() => {
    if (!slug) return;
    window.location.replace(`/f/${encodeURIComponent(slug)}#tip`);
  }, [slug]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] text-sm text-white/40">
      Opening artist page…
    </div>
  );
}
