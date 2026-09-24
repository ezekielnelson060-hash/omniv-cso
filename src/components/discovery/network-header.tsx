import Link from "next/link";
import Image from "next/image";

export function NetworkHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
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
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/home"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-zinc-400 transition hover:text-white sm:inline"
          >
            Home
          </Link>
          <Link
            href="/explore"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-zinc-400 transition hover:text-white sm:inline"
          >
            Explore
          </Link>
          <Link
            href="/saved"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-zinc-400 transition hover:text-white sm:inline"
          >
            Saved
          </Link>
          <Link
            href="/profile"
            className="rounded-full px-3 py-1.5 text-[13px] text-zinc-400 transition hover:text-white"
          >
            Profile
          </Link>
          <Link
            href="/publish"
            className="rounded-full bg-omniv-gold px-3.5 py-1.5 text-[13px] font-semibold text-black transition hover:bg-omniv-gold/90"
          >
            Publish
          </Link>
        </nav>
      </div>
    </header>
  );
}
