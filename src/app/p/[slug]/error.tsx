"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureClientError } from "@/lib/monitoring";

export default function PublicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientError({
      message: error.message,
      stack: error.stack,
      component: "publication-page",
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#050505] px-6 text-center">
      <p className="text-[17px] font-semibold text-white">Something broke</p>
      <p className="max-w-sm text-[13px] text-zinc-500">
        We logged it. Try again — if it keeps happening, email support@omniv.media
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="flex h-11 items-center rounded-full bg-white/[0.08] px-6 text-[14px] font-medium text-white"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
