import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data deletion request",
  description:
    "How to request deletion of your Omniv account data, including data linked via Facebook Login.",
  alternates: { canonical: "https://omniv.media/data-deletion" },
};

export default async function DataDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const sp = await searchParams;
  const code = sp.code?.trim();

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 py-12 text-omniv-text">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
        Privacy
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Data deletion
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-omniv-text-secondary">
        You can request that Omniv delete personal data associated with your
        account, including information received when you connect Facebook Login.
      </p>
      {code ? (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px]">
          <p className="font-medium text-emerald-300">Request received</p>
          <p className="mt-1 text-omniv-text-muted">
            Confirmation code:{" "}
            <span className="font-mono text-omniv-text">{code}</span>
          </p>
          <p className="mt-2 text-omniv-text-muted">
            Keep this code. We process deletion requests as soon as practical
            (usually within 30 days). Contact support if you need status.
          </p>
        </div>
      ) : null}
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-[14px] text-omniv-text-secondary">
        <li>
          Email{" "}
          <a
            className="text-omniv-gold underline-offset-2 hover:underline"
            href="mailto:ezekielnelson060@gmail.com?subject=Omniv%20data%20deletion%20request"
          >
            ezekielnelson060@gmail.com
          </a>{" "}
          from the address on your Omniv account with subject “Data deletion
          request”.
        </li>
        <li>
          Include your Omniv email and, if you used Facebook Login, the Facebook
          user id if you have it.
        </li>
        <li>
          We delete or anonymize account profile data, linked OAuth tokens, and
          fan/list data tied to your user id, except records we must keep for
          law or fraud prevention.
        </li>
      </ol>
      <p className="mt-6 text-[13px] text-omniv-text-muted">
        Facebook users may also trigger deletion from Facebook’s settings; Meta
        calls our automated callback at{" "}
        <code className="text-[12px]">/api/facebook/data-deletion</code>.
      </p>
      <p className="mt-8">
        <Link
          href="/privacy"
          className="text-[13px] text-omniv-gold underline-offset-2 hover:underline"
        >
          Privacy policy
        </Link>
        {" · "}
        <Link
          href="/"
          className="text-[13px] text-omniv-gold underline-offset-2 hover:underline"
        >
          Home
        </Link>
      </p>
    </main>
  );
}
