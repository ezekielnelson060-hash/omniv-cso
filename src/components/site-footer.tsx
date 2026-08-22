import Link from "next/link";
import Image from "next/image";

/** Shared marketing footer — product, resources, legal. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#070707]">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-[15px] font-semibold text-omniv-text">
                Omniv
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Artist market demand intelligence: fan gate, city scores, rooms,
              tips, ranked moves, Ziki (visual CSO). Verify demand. Then spend.
            </p>
            <p className="mt-4 text-[12px] text-zinc-600">omniv.media</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li>
                <Link href="/verify" className="hover:text-zinc-200">
                  Verify market
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-zinc-200">
                  Start free
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-zinc-200">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-200">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Resources
            </p>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li>
                <Link href="/blog" className="hover:text-zinc-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-zinc-200">
                  Policies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-500">
              <li>
                <Link href="/privacy" className="hover:text-zinc-200">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-200">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-zinc-200">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-zinc-200">
                  Data deletion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 text-[12px] text-zinc-600">
          © {year} Omniv. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
