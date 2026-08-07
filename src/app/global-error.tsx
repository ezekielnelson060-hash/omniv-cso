"use client";

import { useEffect } from "react";
import { captureClientError } from "@/lib/monitoring";

export default function GlobalError({
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
      component: "global-error",
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#f7f6f3] p-6 text-[#14130f]">
        <p className="text-sm font-semibold">Something broke</p>
        <p className="max-w-sm text-center text-xs text-[#5c584e]">
          We logged it. Try again — if it keeps happening, email support@omniv.media
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#b8922a] px-4 py-2 text-xs font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
