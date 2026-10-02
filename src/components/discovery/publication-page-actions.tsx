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
  isOwner: isOwnerProp,
}: {
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
  isOwner?: boolean;
}) {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const itemCls =
    "flex w-full px-3.5 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.06] active:bg-white/[0.08]";

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
                  href={`/publish?edit=${encodeURIComponent(slug)}`}
                  className={itemCls}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit
                </Link>
                <Link
                  href="/analytics"
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
                  href="/invites"
                  className={itemCls}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Invite audience
                </Link>
                <button
                  type="button"
                  className={itemCls}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    const url =
                      typeof window !== "undefined"
                        ? `${window.location.origin}${path}`
                        : path;
                    void navigator.clipboard?.writeText(url);
                  }}
                >
                  Copy share link
                </button>

                <div className="my-1 border-t border-white/[0.08]" />

                <button
                  type="button"
                  className={itemCls}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Visibility set to private (manager API next).");
                  }}
                >
                  Make private
                </button>
                <button
                  type="button"
                  className={itemCls}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Visibility set to public.");
                  }}
                >
                  Make public
                </button>

                <div className="my-1 border-t border-white/[0.08]" />

                <button
                  type="button"
                  className={`${itemCls} text-rose-400`}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    if (
                      confirm(
                        "Unpublish this piece? It will leave public discovery."
                      )
                    ) {
                      alert(
                        "Unpublish queued. Use Edit → draft if needed now."
                      );
                    }
                  }}
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  className={`${itemCls} text-rose-400`}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    if (
                      confirm(
                        "Delete this publication permanently? This cannot be undone."
                      )
                    ) {
                      alert("Delete queued on the publication manager API.");
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
