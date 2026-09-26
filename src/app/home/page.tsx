import Link from "next/link";
import Image from "next/image";
import {
  FeedFeaturedCard,
  FeedCompactCard,
  FeedCard,
} from "@/components/discovery/feed-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { listLivePublications } from "@/lib/discovery/db";
import {
  newestPublications,
  trendingPublications,
} from "@/lib/discovery/seed";
import type { Publication } from "@/lib/discovery/types";

export const metadata = {
  title: "Home | Omniv",
  description:
    "Discover what matters next — For You, Following, Trending, and New on Omniv.",
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

/** Discovery layers — not a chronological Substack feed */
const TABS = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
] as const;

const CATEGORIES = [
  "World",
  "Technology",
  "Africa",
  "Research",
  "Music",
  "Business",
  "People",
];

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

function sortHeat(a: Publication, b: Publication) {
  return (b.heat ?? 0) - (a.heat ?? 0);
}

function sortNew(a: Publication, b: Publication) {
  return (b.publishedAt || "").localeCompare(a.publishedAt || "");
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.tab ?? "for-you";

  const supabase = await tryClient();
  const mixed = await listLivePublications(supabase, 40);

  /** Rank by discovery layer — For You mixes types; Following = chronological; Trending = heat/velocity proxy; New = fresh */
  let items: Publication[] = mixed;
  if (tab === "new") {
    items = [...mixed].sort(sortNew).slice(0, 18);
  } else if (tab === "following") {
    // Relationship feed: latest publications (server follow graph wires in V2)
    items = [...mixed].sort(sortNew).slice(0, 18);
  } else if (tab === "trending") {
    items = [...mixed].sort(sortHeat).slice(0, 18);
  } else {
    // For You — diversity-aware mix: heat + type variety
    const byHeat = [...mixed].sort(sortHeat);
    const diverse: Publication[] = [];
    for (const p of byHeat) {
      const typeCount = diverse.filter((x) => x.type === p.type).length;
      if (typeCount < 3) diverse.push(p);
      if (diverse.length >= 16) break;
    }
    items = diverse.length >= 6 ? diverse : byHeat.slice(0, 16);
    if (items.length === 0) items = trendingPublications(12);
  }

  if (items.length < 6) {
    const seed =
      tab === "new" || tab === "following"
        ? newestPublications(12)
        : trendingPublications(12);
    const slugs = new Set(items.map((p) => p.slug));
    for (const s of seed) {
      if (!slugs.has(s.slug)) items.push(s);
      if (items.length >= 14) break;
    }
  }

  const featured = items[0];
  const rest = items.slice(1);
  const compactTypes = new Set([
    "music",
    "product",
    "opportunity",
    "announcement",
  ]);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md md:hidden"
              />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                OMNIV
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/explore"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              </Link>
              <NotificationBell />
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5 md:max-w-2xl md:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {tab === "for-you"
                ? "For You"
                : tab === "following"
                  ? "Following"
                  : tab === "trending"
                    ? "Trending"
                    : "New"}
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              {tab === "for-you"
                ? "Discover what matters to you."
                : tab === "following"
                  ? "Latest from people and entities you follow."
                  : tab === "trending"
                    ? "Gaining attention across the network."
                    : "Fresh publications on Omniv."}
            </p>
          </div>

          <div className="mt-4 -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={t.id === "for-you" ? "/home" : `/home?tab=${t.id}`}
                  className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-medium leading-none transition ${
                    active
                      ? "bg-omniv-gold text-black"
                      : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/explore?interest=${encodeURIComponent(c)}`}
                className="inline-flex h-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04] px-3.5 text-[12px] font-medium leading-none text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200"
              >
                {c}
              </Link>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {featured && <FeedFeaturedCard pub={featured} showExplore />}

            {rest.map((pub) =>
              compactTypes.has(pub.type) ? (
                <FeedCompactCard key={pub.id} pub={pub} />
              ) : (
                <FeedCard key={pub.id} pub={pub} />
              )
            )}

            {items.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[14px] text-zinc-500">
                  {tab === "following"
                    ? "Follow entities to fill this feed."
                    : "Nothing here yet."}
                </p>
                <Link
                  href={tab === "following" ? "/explore" : "/publish"}
                  className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
                >
                  {tab === "following" ? "Explore entities" : "Publish something"}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-10 rounded-2xl bg-white/[0.03] p-5 text-center">
            <p className="text-[15px] font-medium text-white">
              Looking for something specific?
            </p>
            <Link
              href="/explore"
              className="mt-3 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
            >
              Open Explore
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
