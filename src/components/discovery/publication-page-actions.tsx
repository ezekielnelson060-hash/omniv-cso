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
 * Like · Save · Share · ⚡ Promote
 * Owner also gets ⋯ menu: Edit · Analytics · Promote · Invite · Unpublish
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

  const isOwner =
    isOwnerProp === true ||
    (identity != null &&
      ((publisherId && identity.id === publisherId) ||
        (publisherName && identity.name === publisherName)));

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
        <Link
          href={`/promote?slug=${encodeURIComponent(slug)}`}
          className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-omniv-gold px-3.5 text-[12px] font-semibold text-black shadow-sm shadow-omniv-gold/20 transition hover:brightness-110"
        >
          <span aria-hidden>⚡</span>
          Promote
        </Link>

        {isOwner && (
          <div className="relative">
            <button
              type="button"
              aria-label="More actions"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              ⋯
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-2xl bg-[#0c0c0c] py-1.5 shadow-2xl ring-1 ring-white/10">
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
                    ⚡ Promote
                  </OwnerMenuLink>
                  <OwnerMenuLink
                    href="/invites"
                    onClick={() => setMenuOpen(false)}
                  >
                    Invite audience
                  </OwnerMenuLink>
                  <OwnerMenuLink
                    href={`/p/${slug}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Share
                  </OwnerMenuLink>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    type="button"
                    className="flex w-full px-4 py-2.5 text-left text-[13px] text-rose-400 transition hover:bg-white/[0.04]"
                    onClick={() => {
                      setMenuOpen(false);
                      alert(
                        "Unpublish ships with the publication manager API. Use Edit → draft for now."
                      );
                    }}
                  >
                    Unpublish
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
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
      className="flex w-full px-4 py-2.5 text-[13px] text-zinc-200 transition hover:bg-white/[0.04]"
    >
      {children}
    </Link>
  );
}
