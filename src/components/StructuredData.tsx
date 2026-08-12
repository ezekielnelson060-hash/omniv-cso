/** JSON-LD for Google rich results — keep payloads honest (no fake ratings). */
export function StructuredData({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationGraph = {
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
        width: 512,
        height: 512,
      },
      description:
        "AI career strategist for independent artists. Omniv ranks highest-impact career moves, maps fans by city and intent, and helps you open ticketed rooms.",
    },
    {
      "@type": "WebSite",
      "@id": "https://omniv.media/#website",
      url: "https://omniv.media/",
      name: "Omniv",
      publisher: { "@id": "https://omniv.media/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://omniv.media/#software",
      name: "Omniv",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://omniv.media/",
      description:
        "Career OS for independents: fan city + intent briefs, Agent outside signals, ticketed rooms, tips, and ranked moves.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free artist scan and Fan Gate",
      },
      featureList:
        "AI career strategist, Fan city mapping, Intent-to-attend briefs, Ticketed rooms, Tip links, Market signals, Catalogue tools",
      publisher: { "@id": "https://omniv.media/#organization" },
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
            text: "Omniv is an AI career strategist for independent artists. It maps fans by city and intent, ranks the highest-impact next move, and helps you open ticketed rooms and tip links without waiting for a label.",
          },
        },
        {
          "@type": "Question",
          name: "How does Omniv help artists make money?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Omniv turns owned Fan Gate data into a demand brief: how many fans would show up in a city, what ticket price fits, and what size venue. You open a room, collect tips, and get paid out to your bank.",
          },
        },
        {
          "@type": "Question",
          name: "Is Omniv free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The free artist scan, Fan Gate, and core tools are available without a paid plan. Advanced usage limits apply on higher tiers.",
          },
        },
        {
          "@type": "Question",
          name: "What makes Omniv different from Spotify for Artists?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Spotify for Artists shows past analytics. Omniv tells you what to do next — one ranked move, city demand math, outside market signals, and execution tools like rooms and tip links.",
          },
        },
      ],
    },
  ],
};
