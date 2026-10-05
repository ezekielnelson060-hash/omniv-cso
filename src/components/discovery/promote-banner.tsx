"use client";

import Link from "next/link";
import { PUBLICATION_LABELS, type PublicationType } from "@/lib/discovery/types";

const PROMOTE_COPY: Record<string, string> = {
  article: "Promote this article to reach people who care about this topic.",
  music: "Promote this track to listeners who will actually play it.",
  video: "Promote this video to the people most likely to watch.",
  research: "Promote this research to the people who need it.",
  product: "Promote this product to people ready to buy or try it.",
  event: "Promote this event to people who will show up.",
  opportunity: "Promote this opportunity to the right candidates.",
  announcement: "Promote this announcement so the right people see it.",
  file: "Promote this file to people who need it.",
  image: "Promote this image to people who will engage with it.",
};

export function PromoteBanner({
  slug,
  type,
}: {
  slug: string;
  type: PublicationType | string;
}) {
  const label =
    PUBLICATION_LABELS[type as PublicationType]?.toLowerCase() || "publication";
  const copy =
    PROMOTE_COPY[type] ||
    `Promote this ${label} to reach people who matter to you.`;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.08]">
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-zinc-300">
        {copy}
      </p>
      <Link
        href={`/promote?slug=${encodeURIComponent(slug)}`}
        className="shrink-0 inline-flex h-9 items-center rounded-full bg-omniv-gold px-4 text-[12px] font-semibold text-black transition hover:brightness-110"
      >
        Promote
      </Link>
    </div>
  );
}
