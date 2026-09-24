"use client";

import { useEffect, useState } from "react";
import { isFollowing, toggleFollow } from "@/lib/discovery/local-graph";

export function FollowButton({
  type,
  slug,
  name,
  id,
}: {
  type: string;
  slug: string;
  name: string;
  id?: string;
}) {
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing(type, slug));
    setReady(true);
  }, [type, slug]);

  function onClick() {
    const next = toggleFollow({ type, slug, name, id });
    setFollowing(next);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready}
      className={`inline-flex h-11 min-w-[100px] items-center justify-center rounded-full px-5 text-[13px] font-semibold transition ${
        following
          ? "border border-white/20 bg-transparent text-white hover:border-white/35"
          : "bg-omniv-gold text-black hover:bg-omniv-gold/90"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
