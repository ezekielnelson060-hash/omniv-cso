import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Omniv",
  description: "Terms governing use of the Omniv platform.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-omniv-text-muted">Last updated 1 August 2026</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-omniv-text-secondary">
          <Sec t="1. Agreement">
            By creating an account or using Omniv you agree to these Terms and our{" "}
            <Link href="/privacy" className="text-omniv-gold hover:underline">
              Privacy Policy
            </Link>
            .
          </Sec>
          <Sec t="2. The service">
            Omniv provides AI-assisted strategy tools, CRM, fan capture, analytics,
            and related software for artists, managers, and labels. Features may
            change as we improve the product.
          </Sec>
          <Sec t="3. Accounts">
            You must provide accurate information and keep credentials secure. You
            are responsible for activity under your account and invited team seats.
          </Sec>
          <Sec t="4. Acceptable use">
            No unlawful content, spam, scraping that violates third-party terms,
            or attempts to disrupt the service. Fan capture requires valid consent.
          </Sec>
          <Sec t="5. AI outputs">
            Ziki and other AI features provide suggestions, not legal, financial,
            or professional advice. You remain responsible for decisions you make.
          </Sec>
          <Sec t="6. Subscriptions & billing">
            Paid plans are billed via Flutterwave or other processors we designate.
            Fees are due as shown at checkout. Plan access unlocks after payment
            confirmation.
          </Sec>
          <Sec t="7. Intellectual property">
            Omniv and its marks belong to us. You retain rights to content you
            upload. You grant us a license to host and process it to run the service.
          </Sec>
          <Sec t="8. Third-party platforms">
            OAuth connections (e.g. Spotify, YouTube) are subject to those platforms'
            terms. We are not responsible for their availability.
          </Sec>
          <Sec t="9. Disclaimers">
            Service is provided "as is" within the limits of applicable law.
          </Sec>
          <Sec t="10. Limitation of liability">
            To the fullest extent permitted, our liability is limited to fees paid
            in the three months before the claim.
          </Sec>
          <Sec t="11. Termination">
            You may stop using Omniv anytime. We may suspend accounts that breach
            these Terms.
          </Sec>
          <Sec t="12. Contact">
            <a href="mailto:legal@omniv.media" className="text-omniv-gold hover:underline">
              legal@omniv.media
            </a>
          </Sec>
        </div>
      </main>
    </div>
  );
}

function Sec({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-omniv-text">{t}</h2>
      <div>{children}</div>
    </section>
  );
}
