import type { Metadata, Viewport } from "next";
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

const DESC =
  "Publish anything worth discovering. Find people, companies, brands, products, and opportunities — with intent.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
  ),
  title: {
    default: "Omniv — Discovery network for the real world",
    template: "%s | Omniv",
  },
  description: DESC,
  keywords: [
    "discovery network",
    "find companies",
    "find brands",
    "opportunities",
    "publish profile",
    "products",
    "projects",
  ],
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Omniv",
  },
  openGraph: {
    title: "Omniv — Discovery network for the real world",
    description: DESC,
    url: "https://omniv.media",
    siteName: "Omniv",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Omniv — discovery network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omniv — Discovery network for the real world",
    description: DESC,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://omniv.media",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
                    "Discovery network for people, companies, brands, products, projects, events, and opportunities.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://omniv.media/#website",
                  url: "https://omniv.media/",
                  name: "Omniv",
                  publisher: { "@id": "https://omniv.media/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://omniv.media/explore?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
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
