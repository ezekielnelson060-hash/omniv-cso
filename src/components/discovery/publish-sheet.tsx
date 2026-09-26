"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";

const TYPES: { id: string; label: string; hint: string }[] = [
  { id: "article", label: "Article", hint: "Longform & essays" },
  { id: "music", label: "Music", hint: "Tracks & releases" },
  { id: "video", label: "Video", hint: "Clips & films" },
  { id: "research", label: "Research", hint: "Papers & reports" },
  { id: "product", label: "Product", hint: "Things to discover" },
  { id: "event", label: "Event", hint: "Dates & rooms" },
  { id: "announcement", label: "Announcement", hint: "News & updates" },
  { id: "opportunity", label: "Opportunity", hint: "Roles & calls" },
  { id: "file", label: "File", hint: "Docs & downloads" },
];

export function PublishSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [displayName, setDisplayName] = useState("You");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActive(readActiveAccount());
    try {
      setDisplayName(readProfile().displayName || "You");
    } catch {
      /* ignore */
    }
    return onAccountSwitch(setActive);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  const publishingAs = active?.name || displayName;
  const publishingType = active ? active.type : "Personal";

  function pick(type: string) {
    onClose();
    router.push(`/publish?type=${encodeURIComponent(type)}`);
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#0c0c0c] px-5 pb-8 pt-4 shadow-2xl ring-1 ring-white/10 sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-white">Create</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-[13px] text-zinc-500">What are you publishing?</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id)}
              className="flex flex-col items-start rounded-2xl bg-white/[0.04] px-3 py-3.5 text-left transition hover:bg-white/[0.07] active:scale-[0.98]"
            >
              <span className="text-[14px] font-semibold text-white">
                {t.label}
              </span>
              <span className="mt-0.5 text-[11px] text-zinc-500">{t.hint}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Publishing as
          </p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
              {publishingAs.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-white">
                {publishingAs}
              </p>
              <p className="text-[12px] capitalize text-zinc-500">
                {publishingType}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/accounts");
              }}
              className="text-[12px] font-medium text-omniv-gold"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
