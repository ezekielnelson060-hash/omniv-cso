import Link from "next/link";
import Image from "next/image";
import {
  FeedFeaturedCard,
  FeedCompactCard,
  FeedCard,
} from "@/components/discovery/feed-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { listLivePublications } from "@/lib/discovery/db";
import {
  newestPublications,
  publicationsByType,
  trendingPublications,
} from "@/lib/discovery/seed";
import type { Publication } from "@/lib/discovery/types";

export const metadata = {
  title: "For You",
  description:
    "Personalized picks based on what you follow and what's trending.",
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { id: "for-you", label: "For You" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "music", label: "Music" },
  { id: "articles", label: "Articles" },
] as const;

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

  let items: Publication[] = mixed;
  if (tab === "new") {
    items = [...mixed].sort(sortNew).slice(0, 16);
  } else if (tab === "music") {
    items = mixed.filter((p) => p.type === "music");
    if (items.length < 3) items = publicationsByType("music");
  } else if (tab === "articles") {
    items = mixed.filter((p) => p.type === "article");
    if (items.length < 3) items = publicationsByType("article");
  } else if (tab === "trending") {
    items = [...mixed].sort(sortHeat).slice(0, 16);
  } else {
    // for-you: heat-ranked mix, fall back to seed trending
    items = [...mixed].sort(sortHeat).slice(0, 16);
    if (items.length === 0) items = trendingPublications(12);
  }

  // ensure density from seed if live is sparse
  if (items.length < 6 && tab !== "music" && tab !== "articles") {
    const seed =
      tab === "new" ? newestPublications(12) : trendingPublications(12);
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
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6">
            <Link href="/home" className="flex items-center gap-2 md:hidden">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md"
                priority
              />
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Omniv
              </span>
            </Link>
            <div className="hidden md:block" />
            <div className="flex items-center gap-2">
              <Link
                href="/explore"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-white"
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
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-omniv-gold/20 text-[12px] font-semibold text-omniv-gold ring-1 ring-omniv-gold/30"
                aria-label="Profile"
              >
                ·
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-24 pt-5 md:max-w-2xl md:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              For You
            </h1>
            <p className="mt-1 text-[13px] text-zinc-500">
              Personalized picks based on what you follow and what's trending.
            </p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={t.id === "for-you" ? "/home" : `/home?tab=${t.id}`}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                    active
                      ? "bg-omniv-gold text-black"
                      : "text-zinc-400 ring-1 ring-white/12 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {featured && <FeedFeaturedCard pub={featured} />}

            {rest.map((pub) =>
              compactTypes.has(pub.type) ? (
                <FeedCompactCard key={pub.id} pub={pub} />
              ) : (
                <FeedCard key={pub.id} pub={pub} />
              )
            )}

            {items.length === 0 && (
              <p className="py-16 text-center text-[14px] text-zinc-500">
                Nothing here yet.{" "}
                <Link href="/explore" className="text-omniv-gold hover:underline">
                  Explore
                </Link>
              </p>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
