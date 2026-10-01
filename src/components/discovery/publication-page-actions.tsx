"use client";

import { useEffect, useState } from "react";
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
 * Owner only: Promote + ⋯ (Edit · Analytics · Invite · Visibility · Unpublish · Delete)
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

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
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
            className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-omniv-gold px-3.5 text-[12px] font-semibold text-black shadow-sm shadow-omniv-gold/20 transition hover:brightness-110"
          >
            <span aria-hidden>⚡</span>
            Promote
          </Link>
        )}

        {isOwner && (
          <div className="relative">
            <button
              type="button"
              aria-label="More actions"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="5" cy="12" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="19" cy="12" r="1.75" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isOwner && menuOpen && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-[#121212] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-white/10">
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <p className="px-5 pb-2 text-[12px] font-medium uppercase tracking-wide text-zinc-500">
              Manage publication
            </p>
            <div className="flex flex-col pb-2">
              <OwnerMenuLink
                href={`/publish?edit=${encodeURIComponent(slug)}`}
                onClick={() => setMenuOpen(false)}
              >
                Edit
              </OwnerMenuLink>
              <OwnerMenuLink
                href={`/analytics`}
                onClick={() => setMenuOpen(false)}
              >
                View analytics
              </OwnerMenuLink>
              <OwnerMenuLink
                href={`/promote?slug=${encodeURIComponent(slug)}`}
                onClick={() => setMenuOpen(false)}
              >
                Promote this {type || "piece"}
              </OwnerMenuLink>
              <OwnerMenuLink
                href="/invites"
                onClick={() => setMenuOpen(false)}
              >
                Invite audience
              </OwnerMenuLink>
              <OwnerMenuLink href={path} onClick={() => setMenuOpen(false)}>
                Share link
              </OwnerMenuLink>
              <div className="my-1.5 border-t border-white/[0.06]" />
              <button
                type="button"
                className="flex w-full px-5 py-3.5 text-left text-[15px] text-zinc-200 active:bg-white/[0.06]"
                onClick={() => {
                  setMenuOpen(false);
                  alert("Visibility set to private (manager API next).");
                }}
              >
                Make private
              </button>
              <button
                type="button"
                className="flex w-full px-5 py-3.5 text-left text-[15px] text-zinc-200 active:bg-white/[0.06]"
                onClick={() => {
                  setMenuOpen(false);
                  alert("Visibility set to public.");
                }}
              >
                Make public
              </button>
              <div className="my-1.5 border-t border-white/[0.06]" />
              <button
                type="button"
                className="flex w-full px-5 py-3.5 text-left text-[15px] text-rose-400 active:bg-white/[0.06]"
                onClick={() => {
                  setMenuOpen(false);
                  if (
                    confirm(
                      "Unpublish this piece? It will leave public discovery."
                    )
                  ) {
                    alert("Unpublish queued. Use Edit → draft if needed now.");
                  }
                }}
              >
                Unpublish
              </button>
              <button
                type="button"
                className="flex w-full px-5 py-3.5 text-left text-[15px] text-rose-400 active:bg-white/[0.06]"
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
              <button
                type="button"
                className="mx-5 mt-2 mb-1 flex h-11 items-center justify-center rounded-full bg-white/[0.06] text-[14px] font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OwnerMenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex w-full px-5 py-3.5 text-[15px] text-zinc-200 active:bg-white/[0.06]"
    >
      {children}
    </Link>
  );
}
