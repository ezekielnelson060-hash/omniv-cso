import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact · Omniv",
  description: "Contact Omniv support and legal.",
};

export default function ContactPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-omniv-text-muted">
          For OAuth app reviews, support, and legal requests
        </p>
        <div className="mt-10 space-y-6 text-sm text-omniv-text-secondary">
          <div className="rounded-2xl border border-omniv-border bg-omniv-card p-5">
            <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
              Support
            </p>
            <a
              href="mailto:support@omniv.media"
              className="mt-1 block text-lg text-omniv-gold hover:underline"
            >
              support@omniv.media
            </a>
          </div>
          <div className="rounded-2xl border border-omniv-border bg-omniv-card p-5">
            <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
              Privacy / data requests
            </p>
            <a
              href="mailto:privacy@omniv.media"
              className="mt-1 block text-lg text-omniv-gold hover:underline"
            >
              privacy@omniv.media
            </a>
          </div>
          <div className="rounded-2xl border border-omniv-border bg-omniv-card p-5">
            <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
              Legal
            </p>
            <a
              href="mailto:legal@omniv.media"
              className="mt-1 block text-lg text-omniv-gold hover:underline"
            >
              legal@omniv.media
            </a>
          </div>
          <p>
            Product:{" "}
            <a href="https://omniv.media" className="text-omniv-gold hover:underline">
              https://omniv.media
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
