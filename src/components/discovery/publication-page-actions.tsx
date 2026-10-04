"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { ShareButton } from "@/components/discovery/share-button";
import { ViewTracker } from "@/components/discovery/view-tracker";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

/**
 * Engagement + publisher control bar.
 * Everyone: Like · Save · Share
 * Owner only: Promote + ⋯ dropdown below the button (not full-screen sheet)
 */
export function PublicationPageActions({
  id,
  slug,
  type,
  title,
  path,
  publishedAt,
  heat,
  tags = [],
  category,
  publisherId,
  publisherName,
  visibility = "public",
  status = "published",
  isOwner: isOwnerProp,
}: {
  id: string;
  slug: string;
  type: string;
  title: string;
  path: string;
  publishedAt?: string | null;
  heat?: number;
  tags?: string[];
  category?: string;
  publisherId?: string | null;
  publisherName?: string | null;
  visibility?: "public" | "private";
  status?: "draft" | "published" | "archived" | "scheduled";
  isOwner?: boolean;
}) {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [currentStatus, setCurrentStatus] = useState(status);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: Event) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isOwner =
    isOwnerProp === true ||
    (identity != null &&
      ((publisherId && identity.id === publisherId) ||
        (publisherName &&
          identity.name &&
          identity.name.toLowerCase() === publisherName.toLowerCase()) ||
        (identity.slug &&
          publisherName &&
          identity.slug.toLowerCase() ===
            publisherName.toLowerCase().replace(/\s+/g, "-"))));

  async function patchPublication(
    patch: Record<string, string>,
    success: string
  ) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update publication");
      if (patch.visibility)
        setCurrentVisibility(patch.visibility as "public" | "private");
      if (patch.status)
        setCurrentStatus(patch.status as typeof currentStatus);
      setMessage(success);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update publication"
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyShareLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Could not copy link");
    }
  }

  async function unpublish() {
    if (
      !window.confirm(
        "Unpublish this piece? It will leave public discovery and return to your drafts."
      )
    )
      return;
    await patchPublication({ status: "draft" }, "Unpublished — saved to drafts");
  }

  const itemCls =
    "flex w-full px-3.5 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.06] active:bg-white/[0.08] disabled:opacity-50";

  return (
    <>
      <ViewTracker
        tags={tags}
        category={category || type}
        publicationSlug={slug}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <PublicationActions
          slug={slug}
          type={type}
          title={title}
          publishedAt={publishedAt}
          initialLikes={heat ?? 0}
          compact
          tags={tags}
          category={category || type}
        />
        <ShareButton title={title} path={path} />

        {isOwner && (
          <Link
            href={`/promote?slug=${encodeURIComponent(slug)}`}
            className="inline-flex h-9 items-center rounded-full bg-omniv-gold px-3.5 text-[12px] font-semibold text-black"
          >
            Promote
          </Link>
        )}

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="More actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <circle cx="12" cy="5" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="12" cy="19" r="1.75" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1.5 max-h-[min(70vh,420px)] w-56 origin-top-right overflow-y-auto rounded-xl bg-[#141414] py-1 shadow-xl ring-1 ring-white/10"
                role="menu"
              >
                <p className="px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Manage
                </p>
                <Link
                  href={`/publish?edit=${encodeURIComponent(id)}`}
                  className={itemCls}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit
                </Link>
                <Link
                  href={`/analytics?publication=${encodeURIComponent(id)}`}
                  className={itemCls}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  View analytics
                </Link>
                <Link
                  href={`/promote?slug=${encodeURIComponent(slug)}`}
                  className={itemCls}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Promote this {type || "piece"}
                </Link>
                <Link
                  href={`/invites?publication=${encodeURIComponent(slug)}`}
                  className={itemCls}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Invite audience
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  className={itemCls}
                  role="menuitem"
                  onClick={() => {
                    void copyShareLink();
                  }}
                >
                  Copy share link
                </button>

                <div className="my-1 border-t border-white/[0.08]" />

                {currentVisibility === "public" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={itemCls}
                    role="menuitem"
                    onClick={() =>
                      void patchPublication(
                        { visibility: "private" },
                        "Article is now private"
                      )
                    }
                  >
                    Make private
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    className={itemCls}
                    role="menuitem"
                    onClick={() =>
                      void patchPublication(
                        { visibility: "public" },
                        "Article is now public"
                      )
                    }
                  >
                    Make public
                  </button>
                )}

                {currentStatus === "published" && (
                  <>
                    <div className="my-1 border-t border-white/[0.08]" />
                    <button
                      type="button"
                      disabled={busy}
                      className={`${itemCls} text-rose-400`}
                      role="menuitem"
                      onClick={() => void unpublish()}
                    >
                      Unpublish
                    </button>
                  </>
                )}

                {(message ||
                  currentVisibility === "private" ||
                  currentStatus === "draft") && (
                  <p className="px-3.5 pb-2 pt-1 text-[11px] text-omniv-gold">
                    {message ||
                      (currentStatus === "draft"
                        ? "Saved to drafts"
                        : "Private publication")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
