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
 * Owner only: Promote + ⋯ menu (server isOwner preferred)
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
  /** Server-resolved owner check — preferred over client identity matching */
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

  // Prefer explicit server prop. Only fall back to identity when prop is undefined.
  const isOwner =
    typeof isOwnerProp === "boolean"
      ? isOwnerProp
      : Boolean(
          identity &&
            publisherId &&
            (identity.id === publisherId ||
              identity.slug === publisherId ||
              identity.name === publisherName)
        );

  async function patchPublication(
    body: Record<string, unknown>,
    okMessage: string
  ) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/discovery/publications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "Update failed"
        );
      }
      if (typeof body.visibility === "string") {
        setCurrentVisibility(body.visibility as "public" | "private");
      }
      if (typeof body.status === "string") {
        setCurrentStatus(
          body.status as "draft" | "published" | "archived" | "scheduled"
        );
      }
      setMessage(okMessage);
      setMenuOpen(false);
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
    await patchPublication(
      { status: "draft" },
      "Unpublished — saved to drafts"
    );
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
      <div className="flex items-center gap-1.5">
        {/* Public engagement — can scroll if tight */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
          <PublicationActions
            slug={slug}
            type={type}
            title={title}
            publishedAt={publishedAt}
            initialLikes={0}
            compact
            tags={tags}
            category={category || type}
          />
          <ShareButton title={title} path={path} />
        </div>

        {/* Publisher-only controls — never wrap under public actions */}
        {isOwner ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={`/promote?slug=${encodeURIComponent(slug)}`}
              className="inline-flex h-9 items-center rounded-full bg-omniv-gold px-3.5 text-[12px] font-semibold text-black"
            >
              Promote
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="More actions"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="5" cy="12" r="1.75" />
                  <circle cx="12" cy="12" r="1.75" />
                  <circle cx="19" cy="12" r="1.75" />
                </svg>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 shadow-xl">
                  <button
                    type="button"
                    className={itemCls}
                    disabled={busy}
                    onClick={() => void copyShareLink()}
                  >
                    Copy link
                  </button>
                  <Link
                    href={`/publish?edit=${encodeURIComponent(slug)}`}
                    className={itemCls}
                    onClick={() => setMenuOpen(false)}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={itemCls}
                    disabled={busy}
                    onClick={() =>
                      void patchPublication(
                        {
                          visibility:
                            currentVisibility === "public"
                              ? "private"
                              : "public",
                        },
                        currentVisibility === "public"
                          ? "Now private"
                          : "Now public"
                      )
                    }
                  >
                    {currentVisibility === "public"
                      ? "Make private"
                      : "Make public"}
                  </button>
                  <button
                    type="button"
                    className={itemCls}
                    disabled={busy || currentStatus === "draft"}
                    onClick={() => void unpublish()}
                  >
                    Unpublish
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {message ? (
        <p className="mt-2 text-[12px] text-zinc-400">{message}</p>
      ) : null}
    </>
  );
}
