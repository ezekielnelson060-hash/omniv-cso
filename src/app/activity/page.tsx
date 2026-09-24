import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";

export const metadata = {
  title: "Activity",
  description: "Updates from publishers you follow.",
};

export default function ActivityPage() {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3 md:max-w-2xl">
          <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
          <span className="text-[15px] font-semibold text-white">Activity</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-10 text-center md:max-w-2xl">
        <p className="text-[15px] text-zinc-400">
          Follow publishers to see new publications here.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
        >
          Explore
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
