export const DISCOVERY_CATEGORIES = [
  { slug: "world", label: "World", description: "Reporting and analysis about the forces shaping countries, diplomacy, and global affairs." },
  { slug: "power", label: "Power", description: "The institutions, alliances, and decisions that determine who can shape what happens next." },
  { slug: "technology", label: "Technology", description: "The companies, systems, and infrastructure changing how the world works." },
  { slug: "money", label: "Money", description: "Trade, capital, industry, and the economic systems behind public life." },
  { slug: "africa", label: "Africa", description: "Ideas, people, companies, and systems shaping Africa and its future." },
  { slug: "history", label: "History", description: "The events and patterns that make the present easier to understand." },
  { slug: "people", label: "People", description: "The people, institutions, and decisions behind consequential stories." },
  { slug: "research", label: "Research", description: "Evidence-led work that explains a system, not just a headline." },
  { slug: "explained", label: "Explained", description: "Clear, source-checked explanations of complex systems and turning points." },
] as const;

export function getDiscoveryCategory(slug: string) {
  return DISCOVERY_CATEGORIES.find((category) => category.slug === slug.toLowerCase());
}
