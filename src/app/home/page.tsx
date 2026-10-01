import Link from "next/link";
import Image from "next/image";
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
import { HomeFeedClient } from "@/components/discovery/home-feed-client";
import { HomeDiscoverySurface } from "@/components/discovery/home-discovery-surface";

export const revalidate = 15;

export const metadata = {
  title: "Home | Omniv",
  description:
    "Discover what's moving — stories, people, companies, ideas and opportunities worth finding.",
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "rising", label: "Rising" },
  { id: "new", label: "New" },
] as const;

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

async function firstNameOf(supabase: Awaited<ReturnType<typeof tryClient>>) {
  if (!supabase) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata || {};
    const fromMeta =
      meta.full_name || meta.name || meta.display_name || meta.first_name;
    if (typeof fromMeta === "string" && fromMeta.trim()) {
      return fromMeta.trim().split(/\s+/)[0];
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    const n = (profile?.full_name as string | null) || "";
    if (n.trim()) return n.trim().split(/\s+/)[0];
    if (user.email) return user.email.split("@")[0];
  } catch {
    /* guest */
  }
  return null;
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.tab ?? "for-you";

  const supabase = await tryClient();
  const mixed = await listLivePublications(supabase, 100);
  const firstName = await firstNameOf(supabase);

  let feedPool: Publication[] = mixed;
  if (feedPool.length < 8) {
    const seed = trendingPublications(30);
    const slugs = new Set(feedPool.map((p) => p.slug));
    for (const s of seed) {
      if (!slugs.has(s.slug)) feedPool.push(s);
      if (feedPool.length >= 60) break;
    }
  }
  if (feedPool.length < 6) {
    const seed = newestPublications(24);
    const slugs = new Set(feedPool.map((p) => p.slug));
    for (const s of seed) {
      if (!slugs.has(s.slug)) feedPool.push(s);
    }
  }

  feedPool = [...feedPool].sort((a, b) => {
    const heatDiff = (b.heat || 0) - (a.heat || 0);
    if (Math.abs(heatDiff) > 2) return heatDiff;
    const ta = new Date(a.publishedAt || 0).getTime();
    const tb = new Date(b.publishedAt || 0).getTime();
    return tb - ta;
  });

  const isForYou = tab === "for-you";

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
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

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
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

          <div className="mt-5">
            {isForYou ? (
              <HomeDiscoverySurface
                publications={feedPool}
                firstName={firstName || undefined}
              />
            ) : (
              <HomeFeedClient
                tab={
                  tab === "following" ||
                  tab === "trending" ||
                  tab === "rising" ||
                  tab === "new"
                    ? tab
                    : "for-you"
                }
                publications={feedPool}
              />
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
