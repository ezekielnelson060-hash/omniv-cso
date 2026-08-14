import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Start free on Omniv. Collect real fan intent, map cities that would attend, and open cash paths beyond streaming.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://omniv.media/signup" },
  openGraph: {
    title: "Join Omniv — Career OS for independent artists",
    description:
      "Fan Gate, city demand maps, ticketed rooms, and ranked next moves. Free to start.",
    url: "https://omniv.media/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
