import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveButton } from "@/components/discovery/save-button";
import { ShareButton } from "@/components/discovery/share-button";
import { PublicationPageActions } from "@/components/discovery/publication-page-actions";
import { FollowButton } from "@/components/discovery/follow-button";
import { StickyArticleHeader } from "@/components/discovery/sticky-article-header";
import { KeepExploring } from "@/components/discovery/keep-exploring";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import { VerifiedBadge } from "@/components/discovery/verified-badge";
import { PublicationMedia } from "@/components/discovery/publication-media";
import { isAlwaysVerified } from "@/lib/discovery/verified";
import { createClient } from "@/lib/supabase/server";
import {
  getDiscoveryEntity,
  getEntityByIdLive,
  getLivePublication,
  listDiscoveryEntities,
  listLivePublications,
  type LivePublication,
  type LiveEntity,
} from "@/lib/discovery/db";
import {
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
} from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";
import { publicationMetadata } from "@/lib/discovery/seo";
import { resolveEntityAvatar } from "@/lib/discovery/resolve-avatar";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";
import { ArticleContent } from "@/components/discovery/article-content";

type Props = { params: Promise<{ slug: string }> };

const HERO: Record<string, string> = {
  article: "from-sky-800 via-slate-900 to-[#050505]",
  music: "from-fuchsia-800 via-purple-950 to-[#050505]",
  video: "from-rose-800 via-red-950 to-[#050505]",
  research: "from-emerald-800 via-teal-950 to-[#050505]",
  product: "from-amber-700 via-orange-950 to-[#050505]",
  event: "from-violet-800 via-indigo-950 to-[#050505]",
  announcement: "from-zinc-700 via-zinc-900 to-[#050505]",
  opportunity: "from-yellow-700 via-yellow-950 to-[#050505]",
  file: "from-cyan-800 via-slate-900 to-[#050505]",
};
