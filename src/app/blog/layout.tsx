import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "Writing from Omniv on discovery, publishing, and building in public.",
  alternates: { canonical: "https://omniv.media/blog" },
  openGraph: {
    title: "Omniv Notes",
    description: "Writing from Omniv on discovery, publishing, and building in public.",
    url: "https://omniv.media/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
