import Link from "next/link";

type Tab = "for-you" | "following" | "trending" | "rising" | "new";

export function HomeEmptyState({ tab }: { tab: Tab }) {
  const emptyCopy =
    tab === "following"
      ? {
          title: "Your Following feed is empty",
          body: "Follow people, companies, and brands — their publications show up here.",
          cta: "Find who to follow",
          href: "/explore",
        }
      : tab === "rising"
        ? {
            title: "Nothing rising yet",
            body: "Rising shows publications accelerating in the last few days.",
            cta: "Browse Trending",
            href: "/home?tab=trending",
          }
        : {
            title: "No publications in this view",
            body: "Explore the network or publish something the world can discover.",
            cta: "Open Explore",
            href: "/explore",
          };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 text-center">
      <p className="text-[15px] font-medium text-white">{emptyCopy.title}</p>
      <p className="mt-1.5 text-[13px] text-zinc-400">{emptyCopy.body}</p>
      <Link
        href={emptyCopy.href}
        className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
      >
        {emptyCopy.cta}
      </Link>
    </div>
  );
}
