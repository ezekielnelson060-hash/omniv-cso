import { FollowerCount } from "@/components/discovery/follower-count";

/** Single-line stats: Followers · Following · Publications */
export function EntityStatsRow({
  type,
  slug,
  publicationsCount,
}: {
  type: string;
  slug: string;
  publicationsCount: number;
}) {
  return (
    <div className="mt-4 flex flex-row flex-nowrap items-baseline gap-5 overflow-x-auto whitespace-nowrap text-[14px] scrollbar-none">
      <FollowerCount type={type} slug={slug} className="shrink-0" />
      <span className="inline-flex shrink-0 items-baseline gap-1">
        <span className="text-[15px] font-semibold tabular-nums text-white">0</span>
        <span className="text-[13px] text-zinc-500">Following</span>
      </span>
      <span className="inline-flex shrink-0 items-baseline gap-1">
        <span className="text-[15px] font-semibold tabular-nums text-white">
          {publicationsCount}
        </span>
        <span className="text-[13px] text-zinc-500">Publications</span>
      </span>
    </div>
  );
}
