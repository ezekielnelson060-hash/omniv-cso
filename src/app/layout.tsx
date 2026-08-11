import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.omniv.media"
  ),
  title: {
    default: "Omniv — AI Career Strategist for Independent Artists",
    template: "%s | Omniv",
  },
  description:
    "Omniv ranks your highest-impact career moves, helps you open ticketed rooms, and turns your catalogue into revenue. Career OS for independent artists, managers, and labels.",
  keywords: [
    "independent artist",
    "music career",
    "AI manager",
    "fan gate",
    "ticketed rooms",
    "music monetization",
    "afrobeat",
    "indie music",
  ],
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Omniv",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  openGraph: {
    title: "Omniv — AI Career Strategist for Artists",
    description:
      "Stop guessing. Ranked next moves, owned fans, ticketed rooms, and first cash.",
    url: "https://www.omniv.media",
    siteName: "Omniv",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omniv — AI Career Strategist",
    description: "The career OS for independent artists.",
  },
  alternates: {
    canonical: "https://www.omniv.media",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light ${instrument.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('omniv-theme');if(t==='dark'){document.documentElement.classList.remove('light');}else{document.documentElement.classList.add('light');}}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-omniv-black text-omniv-text font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
