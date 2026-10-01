"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FollowButton } from "@/components/discovery/follow-button";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

/**
 * Owner sees Edit profile + Contact (never Follow).
 * Viewer sees Follow + Contact.
 * Ownership: server flag OR active identity matches this entity.
 */
export function EntityActionBar({
  type,
  slug,
  name,
  id,
  editPath,
  serverIsOwner = false,
}: {
  type: string;
  slug: string;
  name: string;
  id?: string;
  editPath: string;
  serverIsOwner?: boolean;
}) {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIdentity(readActiveAccount());
    setReady(true);
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  const matchIdentity =
    identity != null &&
    ((id && identity.id === id) ||
      (identity.slug && identity.slug.toLowerCase() === slug.toLowerCase()) ||
      (identity.name &&
        identity.name.toLowerCase() === name.toLowerCase()) ||
      (identity.path && identity.path.includes(`/e/${type}/${slug}`)));

  const isOwner = serverIsOwner || matchIdentity;

  if (!ready && !serverIsOwner) {
    return (
      <div className="mb-1 flex flex-wrap justify-end gap-2">
        <div className="h-10 w-24 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-10 w-20 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="mb-1 flex flex-wrap justify-end gap-2">
        <Link
          href={editPath}
          className="inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black transition hover:bg-omniv-gold/90"
        >
          Edit profile
        </Link>
        <a
          href="#contact"
          className="inline-flex h-10 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-semibold text-white transition hover:bg-white/[0.06]"
        >
          Contact
        </a>
      </div>
    );
  }

  return (
    <div className="mb-1 flex flex-wrap justify-end gap-2">
      <FollowButton type={type} slug={slug} name={name} id={id} />
      <a
        href="#contact"
        className="inline-flex h-10 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-semibold text-white transition hover:bg-white/[0.06]"
      >
        Contact
      </a>
    </div>
  );
}
