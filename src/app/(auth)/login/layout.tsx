import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Omniv — AI career strategist for independent artists. Access Fan Gate, ranked moves, rooms, and tips.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://omniv.media/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
