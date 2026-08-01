import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy · Omniv",
  description: "How Omniv uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-dvh bg-omniv-black text-omniv-text">
      <header className="border-b border-omniv-border px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-omniv-gold">
            Omniv
          </Link>
          <nav className="flex gap-4 text-xs text-omniv-text-muted">
            <Link href="/privacy" className="hover:text-omniv-gold">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-omniv-gold">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-omniv-gold">
              Cookies
            </Link>
            <Link href="/contact" className="hover:text-omniv-gold">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-omniv-text-muted">Last updated 1 August 2026</p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-omniv-text-secondary">
          <p>
            We use essential cookies for authentication (Supabase session) and
            security. These are required to keep you signed in.
          </p>
          <p>
            We may use analytics cookies to understand product usage. Where
            required by law, we will request consent before non-essential cookies.
          </p>
          <p>
            You can control cookies through your browser settings. Disabling
            essential cookies may prevent login.
          </p>
          <p>
            See our{" "}
            <Link href="/privacy" className="text-omniv-gold hover:underline">
              Privacy Policy
            </Link>{" "}
            for more on personal data.
          </p>
        </div>
      </main>
    </div>
  );
}
