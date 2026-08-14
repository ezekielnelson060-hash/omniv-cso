import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free artist career audit",
  description:
    "Run a free Omniv audit on your artist presence. See gaps in owned fans, demand, and monetization — then get ranked next moves.",
  alternates: { canonical: "https://omniv.media/audit" },
  openGraph: {
    title: "Free artist career audit | Omniv",
    description:
      "Spotify-era vanity metrics don't pay. Get a clear audit of demand, owned audience, and what to do next.",
    url: "https://omniv.media/audit",
  },
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
