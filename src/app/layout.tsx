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
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
  ),
  title: {
    default: "Omniv — Verify Your Music Demand",
    template: "%s | Omniv",
  },
  description:
    "Capture demand. Score the market. Open the room. Get paid.",
  keywords: [
    "independent artist",
    "market demand",
    "fan gate",
    "ticketed rooms",
    "music monetization",
    "artist management",
    "city demand",
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
    title: "Omniv — Verify Your Music Demand",
    description:
      "Capture demand. Score the market. Open the room. Get paid.",
    url: "https://omniv.media",
    siteName: "Omniv",
    images: [
      {
        url: "https://omniv.media/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Omniv — verify your music demand before you spend",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omniv — Verify Your Music Demand",
    description:
      "Capture demand. Score the market. Open the room. Get paid.",
    images: ["https://omniv.media/og-image.jpg"],
  },
  alternates: {
    canonical: "https://omniv.media",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://omniv.media/#organization",
                  name: "Omniv",
                  url: "https://omniv.media/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://omniv.media/logo.svg",
                  },
                  description:
                    "Artist market demand intelligence. Maps fans by city and intent, scores demand, ticketed rooms and tips.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://omniv.media/#website",
                  url: "https://omniv.media/",
                  name: "Omniv",
                  publisher: { "@id": "https://omniv.media/#organization" },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://omniv.media/#software",
                  name: "Omniv",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  url: "https://omniv.media/",
                  description:
                    "Verify market demand: city + intent scores, rooms, tips, ranked regional moves, global signals.",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    description: "Free artist scan and Fan Gate",
                  },
                  featureList:
                    "Market demand scores, Fan city mapping, Intent-to-attend, Ticketed rooms, Tip links, Visual CSO",
                  publisher: { "@id": "https://omniv.media/#software" },
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://omniv.media/#faq",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What is Omniv?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Omniv verifies artist market demand. It maps fans by city and intent, scores where people would show up, and helps you open the right-sized room and tip links.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How does Omniv help artists make money?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Omniv turns Fan Gate data into a demand brief: fans, intent-to-attend, ticket price, venue size. Open a room, collect tips, get paid to your bank.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is Omniv free to use?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Free artist scan, Fan Gate, and core tools are available. Higher tiers unlock higher usage limits.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What makes Omniv different from Spotify for Artists?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Spotify for Artists shows past analytics. Omniv verifies demand before you spend — rooms, tip links, and ranked next moves.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-omniv-black text-omniv-text font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
