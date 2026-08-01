import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Omniv",
  description: "How Omniv collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="1 August 2026">
      <Section title="1. Who we are">
        Omniv ("we", "us") operates the Omniv Artist Hub / CSO platform at
        omniv.media and related domains. Contact:{" "}
        <a className="text-omniv-gold hover:underline" href="mailto:privacy@omniv.media">
          privacy@omniv.media
        </a>
        .
      </Section>
      <Section title="2. Data we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Account data: name, email, role (artist, manager, label).</li>
          <li>Artist Brain: genre, goals, interests, career stage you provide.</li>
          <li>Social links and OAuth tokens when you connect platforms.</li>
          <li>Fan capture data: email, optional phone/location, consent, source.</li>
          <li>Usage and billing metadata (plan, transaction refs).</li>
        </ul>
      </Section>
      <Section title="3. How we use data">
        To provide strategy tools (Ziki, scores, CRM), process payments, improve
        the product, and send service communications. We do not sell personal
        data.
      </Section>
      <Section title="4. Legal bases">
        Contract performance, legitimate interests in operating a B2B SaaS, and
        consent (e.g. fan opt-in, marketing where required).
      </Section>
      <Section title="5. Sharing">
        Processors such as Supabase (database/auth), Vercel (hosting), Flutterwave
        (payments), and Google (Gemini API) under appropriate agreements. Fan
        lists remain isolated per artist roster.
      </Section>
      <Section title="6. Retention">
        Account data while your account is active. Fan records until the artist
        org deletes them or you request erasure where applicable.
      </Section>
      <Section title="7. Your rights">
        Access, correction, deletion, portability, and objection where the law
        provides. Email privacy@omniv.media. Fans may unsubscribe via capture
        flows and list tools.
      </Section>
      <Section title="8. Security">
        Encryption in transit, role-based access, and service-role keys restricted
        to server environments.
      </Section>
      <Section title="9. International transfers">
        Data may be processed in regions where our providers operate. We use
        appropriate safeguards.
      </Section>
      <Section title="10. Children">
        Omniv is not directed at children under 16.
      </Section>
      <Section title="11. Changes">
        We may update this policy; material changes will be noted by date above.
      </Section>
    </LegalShell>
  );
}

function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
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
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-omniv-text-muted">Last updated {updated}</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-omniv-text-secondary">
          {children}
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-omniv-text">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
