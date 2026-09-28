"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  readActiveAccount,
  onAccountSwitch,
  isEntityContext,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { readProfile } from "@/lib/discovery/local-profile";

const TYPES: {
  id: string;
  label: string;
  icon: string;
}[] = [
  { id: "article", label: "Article", icon: "doc" },
  { id: "music", label: "Music", icon: "note" },
  { id: "video", label: "Video", icon: "play" },
  { id: "file", label: "File", icon: "folder" },
  { id: "product", label: "Product", icon: "cube" },
  { id: "event", label: "Event", icon: "cal" },
  { id: "opportunity", label: "Opportunity", icon: "bag" },
  { id: "announcement", label: "Announcement", icon: "megaphone" },
  { id: "research", label: "Research", icon: "research" },
];

function TypeIcon({ kind }: { kind: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
  } as const;
  switch (kind) {
    case "doc":
      return (
        <svg {...common}>
          <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
          <path d="M14 3.5V8h4.5" strokeLinejoin="round" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M9 18V6l10-2v12" strokeLinecap="round" />
          <circle cx="7" cy="18" r="2.2" />
          <circle cx="17" cy="16" r="2.2" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5h6l1.5 1.5H20.5v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
        </svg>
      );
    case "cube":
      return (
        <svg {...common}>
          <path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3z" strokeLinejoin="round" />
          <path d="M12 12v9M12 12 20 7.5M12 12 4 7.5" />
        </svg>
      );
    case "cal":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M8 3.5V7M16 3.5V7M3.5 10h17" strokeLinecap="round" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l1 12H5L6 8z" strokeLinejoin="round" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M4 10v4h2l6 3V7L6 10H4z" strokeLinejoin="round" />
          <path d="M16 9.5c1.2.6 2 1.5 2 2.5s-.8 1.9-2 2.5" strokeLinecap="round" />
          <path d="M10 17v2" strokeLinecap="round" />
        </svg>
      );
    case "research":
      return (
        <svg {...common}>
          <path d="M8 4h8v16H8z" strokeLinejoin="round" />
          <path d="M10 8h4M10 12h4M10 16h2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

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
  const [selected, setSelected] = useState<string | null>(null);

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
    if (!open) setSelected(null);
  }, [open]);

  if (!mounted || !open) return null;

  const asEntity = isEntityContext(active);
  const publishingAs = asEntity && active ? active.name : displayName;
  const publishingType = asEntity && active ? active.type : "personal";

  function goPublish() {
    const type = selected || "article";
    onClose();
    router.push(`/publish?type=${encodeURIComponent(type)}`);
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/65"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#0c0c0c] px-5 pb-8 pt-4 shadow-2xl ring-1 ring-white/10 sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-white">Create</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">
              Share your work with the world.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {TYPES.map((t) => {
            const on = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t.id);
                  onClose();
                  router.push(`/publish?type=${encodeURIComponent(t.id)}`);
                }}
                className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 transition active:scale-[0.97] ${
                  on
                    ? "bg-omniv-gold/15 ring-1 ring-omniv-gold/40 text-omniv-gold"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    on ? "bg-omniv-gold/20 text-omniv-gold" : "bg-white/[0.06]"
                  }`}
                >
                  <TypeIcon kind={t.icon} />
                </span>
                <span className="text-[12px] font-medium text-white">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Publish as
          </p>
          <p className="mt-1 text-[12px] text-zinc-500">
            Choose who you're publishing for.
          </p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.06]">
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

        <button
          type="button"
          onClick={goPublish}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black shadow-lg shadow-omniv-gold/20 transition active:scale-[0.98]"
        >
          Publish
        </button>
      </div>
    </div>,
    document.body
  );
}
