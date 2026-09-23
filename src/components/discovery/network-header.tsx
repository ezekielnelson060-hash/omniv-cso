import Link from "next/link";
import Image from "next/image";

export function NetworkHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
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
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/explore"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-zinc-400 transition hover:text-white sm:inline"
          >
            Explore
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-[13px] text-zinc-400 transition hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup?from=publish"
            className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-black transition hover:bg-zinc-200"
          >
            Publish
          </Link>
        </nav>
      </div>
    </header>
  );
}
