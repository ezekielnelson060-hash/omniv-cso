import Link from "next/link";
import Image from "next/image";
import {
  FeedFeaturedCard,
  FeedCompactCard,
  FeedCard,
} from "@/components/discovery/feed-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import {
  newestPublications,
  publicationsByType,
  trendingPublications,
} from "@/lib/discovery/seed";

export const metadata = {
  title: "For You",
  description: "Personalized picks based on what you follow and what's trending.",
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

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.tab ?? "for-you";

  let items = trendingPublications(12);
  if (tab === "new") items = newestPublications(12);
  if (tab === "music") items = publicationsByType("music");
  if (tab === "articles") items = publicationsByType("article");
  if (tab === "trending") items = trendingPublications(12);
  if (tab === "for-you") {
    items = trendingPublications(12);
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
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl">
          <Link href="/home" className="flex items-center gap-2">
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

      <main className="mx-auto max-w-lg px-4 pb-24 pt-5 md:max-w-2xl">
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
                    : "border border-white/12 text-zinc-400 hover:border-white/25 hover:text-white"
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
  );
}
