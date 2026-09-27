"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function VerifyBillingBanner({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("billing") === "success") {
      setShow(true);
      onSuccess?.();
      try {
        router.replace("/verify", { scroll: false });
      } catch {
        /* ignore */
      }
    }
  }, [searchParams, router, onSuccess]);

  if (!show) return null;

  return (
    <div className="mb-5 rounded-2xl bg-emerald-500/10 px-4 py-3 ring-1 ring-emerald-500/20">
      <p className="text-[14px] font-medium text-emerald-300">
        Application fee received
      </p>
      <p className="mt-1 text-[13px] text-zinc-400">
        Your verification is under review. You'll see the badge after Omniv
        approves it.
      </p>
    </div>
  );
}
