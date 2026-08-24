import Link from "next/link";
import Image from "next/image";

/** Update these to your live Omniv pages (or set NEXT_PUBLIC_* env vars). */
const SOCIAL = {
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://www.facebook.com/omniv.media",
  x: process.env.NEXT_PUBLIC_X_URL || "https://x.com/omnivmedia",
  linkedin:
    process.env.NEXT_PUBLIC_LINKEDIN_URL ||
    "https://www.linkedin.com/company/omniv",
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.918 3.777-3.918 1.094 0 2.238.198 2.238.198v2.48h-1.26c-1.243 0-1.63.775-1.63 1.57v1.888h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** Shared marketing footer — product, resources, legal, social. */
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

        <div className="mt-10 flex max-w-md flex-col gap-2.5 sm:max-w-sm">
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-black text-[14px] font-medium text-white ring-1 ring-white/15 transition hover:bg-zinc-900"
          >
            <XIcon className="h-4 w-4" />
            X
          </a>
          <a
            href={SOCIAL.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#1877F2] text-[14px] font-medium text-white transition hover:bg-[#166FE5]"
          >
            <FacebookIcon className="h-4 w-4" />
            Facebook
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#0A66C2] text-[14px] font-medium text-white transition hover:bg-[#0958a8]"
          >
            <LinkedInIcon className="h-4 w-4" />
            LinkedIn
          </a>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-[12px] text-zinc-600">
          © {year} Omniv. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
